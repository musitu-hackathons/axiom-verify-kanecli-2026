import {readFile,writeFile,stat} from 'node:fs/promises';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve('lifeline-capture'),resultFile=resolve(root,'capture-result.json');
const report=JSON.parse(await readFile(resultFile,'utf8'));
for(const s of report.segments){
 if(!s.path)continue;
 const outfile=resolve(root,s.id+'.mp4');
 const f=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',s.path,'-r','30','-c:v','libx264','-crf','21','-preset','fast','-pix_fmt','yuv420p','-movflags','+faststart',outfile],{encoding:'utf8',timeout:180000});
 s.mp4=f.status===0?outfile:null;
 if(s.mp4)console.log('Genuine recorded MP4: '+outfile+' ('+(await stat(outfile)).size+' bytes)');
 else console.error('Video export failure: '+String(f.stderr).slice(0,500));
}
await writeFile(resultFile,JSON.stringify(report,null,2));
if(report.segments.filter(s=>s.mp4).length!==2)process.exitCode=1;
