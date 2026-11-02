#!/usr/bin/env node
/**
 * Local impact graph for NexaPag UX/UI. This is NOT a Graphify workspace graph.
 * Provenance is explicit ES/CSS imports and script/style links in index.html.
 * It provides an always-on CI fallback until Graphify repository indexing is authorized.
 */
import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, relative, dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const canonical=(path)=>path.replaceAll('\\','/').replace(/^\.\//,'');
const normalize=(from,spec)=>{
  if(!spec.startsWith('.'))return null;
  const candidate=resolve(ROOT,dirname(from),spec);
  const result=canonical(relative(ROOT,candidate));
  return result.startsWith('../')?null:result;
};
function collect(directory){
  if(!existsSync(resolve(ROOT,directory)))return [];
  const list=[];
  for(const dirent of readdirSync(resolve(ROOT,directory),{withFileTypes:true})){
    const path=canonical(join(directory,dirent.name));
    if(dirent.isDirectory())list.push(...collect(path));
    else if(/\.(?:js|css|mjs|html)$/.test(dirent.name))list.push(path);
  }
  return list;
}
export function buildImpactGraph(root=ROOT){
  const files=collect('src').concat(collect('tests'),['index.html'])
    .filter(path=>existsSync(resolve(root,path)));
  const all=new Set(files);
  const edges=[];
  for(const file of files){
    const body=readFileSync(resolve(root,file),'utf8');
    if(file.endsWith('.js')||file.endsWith('.mjs')){
      for(const match of body.matchAll(/\bimport\s+(?:[^'";]+?\s+from\s+)?['"]([^'"]+)['"]/g)){
        const target=normalize(file,match[1]);
        if(target&&all.has(target))edges.push({from:file,to:target,kind:'es-import'});
      }
    }
    if(file.endsWith('.css')){
      for(const match of body.matchAll(/@import\s+(?:url\()?\s*['"]([^'"]+)['"]/g)){
        const target=normalize(file,match[1]);
        if(target&&all.has(target))edges.push({from:file,to:target,kind:'css-import'});
      }
    }
    if(file==='index.html'){
      for(const match of body.matchAll(/<(?:script|link)\b[^>]*?(?:src|href)=['"]([^'"]+)['"][^>]*>/g)){
        const target=normalize(file,match[1]);
        if(target&&all.has(target))edges.push({from:file,to:target,kind:'html-resource'});
      }
    }
  }
  const contracts=[
    {id:'motion-ui',owner:'src/motion-studio-920.js',dependsOn:['src/motion-studio-920.css','src/main.js','tests/motion-studio-920.test.mjs'],risk:'motion timing and reduced-motion'},
    {id:'material',owner:'src/material-engine-919.js',dependsOn:['src/material-engine-919.css','src/workbench.js'],risk:'glass tint, opacity and surface contrast'},
    {id:'geometry',owner:'src/geometry-system-918.js',dependsOn:['src/geometry-system-918.css','tests/geometry-system-918.test.mjs'],risk:'layout geometry and touch targets'},
    {id:'finance',owner:'src/app.js',dependsOn:['src/stacked-liquid.js','src/styles.css'],risk:'heatmap, charts, five routes and liquid'},
    {id:'workbench',owner:'src/workbench.js',dependsOn:['src/app.js','src/main.js'],risk:'live controls and fidelity'},
  ];
  const errors=[];
  for(const contract of contracts){
    for(const path of [contract.owner,...contract.dependsOn]){
      if(!existsSync(resolve(root,path)))errors.push('Missing '+contract.id+': '+path);
    }
  }
  const entry=edges.filter(edge=>edge.from==='src/main.js').map(edge=>edge.to);
  for(const path of ['src/app.js','src/workbench.js','src/material-engine-919.js','src/motion-studio-920.js']){
    if(!entry.includes(path))errors.push('Production entry no longer imports '+path);
  }
  const motion=readFileSync(resolve(root,'src/motion-studio-920.js'),'utf8');
  if(!motion.includes('MAX_SEQUENCE_MS=500')||!motion.includes('MAX_STAGE_ITEMS=6')){
    errors.push('Motion choreography lost purpose/sequence budget');
  }
  if(motion.includes("'.transaction,.bankcard'")||motion.includes("'.transaction'")){
    errors.push('Motion must not animate entire financial transaction lists');
  }
  const graph={schema:'nexapag-local-impact-v1',source:'GitHub repository files',graphify:{indexed:false,reason:'No selected Graphify workspace; manual authorization required'},
    entries:['index.html','src/main.js'],nodes:[...all].sort(),edges:edges.sort((a,b)=>(a.from+a.to).localeCompare(b.from+b.to)),
    contracts,errors};
  return graph;
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  const graph=buildImpactGraph();
  const out=process.argv.find(arg=>arg.startsWith('--output='))?.slice(9)||'test-results/design-impact.json';
  const full=resolve(ROOT,out);
  mkdirSync(dirname(full),{recursive:true});
  writeFileSync(full,JSON.stringify(graph,null,2)+'\n');
  console.log('Local design impact: '+graph.nodes.length+' files, '+graph.edges.length+' imported resources, '+graph.errors.length+' contract violations');
  console.log('Graphify indexed: NO (workspace authorization required)');
  if(graph.errors.length)for(const error of graph.errors)console.error('FAIL:',error);
  if(graph.errors.length)process.exitCode=1;
}
