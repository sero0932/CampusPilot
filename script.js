const KEY="campuspilot_v1";
let data=JSON.parse(localStorage.getItem(KEY)||"null")||{
 tasks:[
  {id:1,title:"Complete Java OOP assignment",deadline:"2026-09-19",priority:"High",done:false},
  {id:2,title:"Revise DBMS Chapter 3",deadline:"2026-09-20",priority:"Medium",done:false}
 ],
 assignments:[{id:1,title:"Java OOP Assignment",subject:"Java",deadline:"2026-09-19",status:"Pending"}],
 attendance:[
  {id:1,subject:"Java",present:25,total:30},
  {id:2,subject:"DBMS",present:22,total:28},
  {id:3,subject:"Python",present:18,total:26}
 ],
 timetable:[
  {id:1,day:"Monday",time:"10:00 AM",subject:"Java",room:"Lab 2"},
  {id:2,day:"Monday",time:"12:00 PM",subject:"DBMS",room:"Room 104"},
  {id:3,day:"Tuesday",time:"11:00 AM",subject:"Python",room:"Lab 1"}
 ]};

function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function showSection(id){
 document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
 document.getElementById(id).classList.add("active");
 document.querySelectorAll(".nav").forEach(n=>n.classList.toggle("active",n.dataset.section===id));
 document.getElementById("pageTitle").textContent={dashboard:"Good morning 👋",academic:"Academic Hub",ai:"AI Daily Partner",productivity:"Productivity"}[id];
 render();
}
document.querySelectorAll(".nav").forEach(n=>n.onclick=()=>showSection(n.dataset.section));

function render(){
 const pending=data.tasks.filter(t=>!t.done);
 document.getElementById("taskCount").textContent=pending.length;
 document.getElementById("assignmentCount").textContent=data.assignments.filter(a=>a.status!=="Completed").length;
 const avg=data.attendance.length?Math.round(data.attendance.reduce((s,a)=>s+(a.present/a.total*100),0)/data.attendance.length):0;
 document.getElementById("attendanceAvg").textContent=avg+"%";
 document.getElementById("urgentCount").textContent=pending.filter(t=>t.priority==="High").length;
 document.getElementById("dateText").textContent=new Date().toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"});
 renderTasks(); renderAssignments(); renderAttendance(); renderTimetable(); updateRecommendation();
}
function renderTasks(){
 const html=data.tasks.length?data.tasks.map(t=>`<div class="item"><div><div class="item-title ${t.done?"done":""}">${t.done?"☑":"☐"} ${esc(t.title)}</div><div class="muted">Deadline: ${t.deadline||"No deadline"}</div></div><div><span class="priority ${t.priority}">${t.priority}</span> <button class="action" onclick="toggleTask(${t.id})">${t.done?"Undo":"Done"}</button></div></div>`).join(""):"<p class='muted'>No tasks yet.</p>";
 document.getElementById("taskList").innerHTML=html; document.getElementById("allTasks").innerHTML=html;
 const done=data.tasks.filter(t=>t.done).length; document.getElementById("progressText").textContent=`${done}/${data.tasks.length} completed`;
}
function renderAssignments(){
 document.getElementById("assignmentList").innerHTML=data.assignments.length?data.assignments.map(a=>`<div class="item"><div><div class="item-title">${esc(a.title)}</div><div class="muted">${esc(a.subject)} · Deadline: ${a.deadline}</div></div><span class="priority">${a.status}</span></div>`).join(""):"<p class='muted'>No assignments.</p>";
}
function renderAttendance(){
 document.getElementById("attendanceList").innerHTML=data.attendance.map(a=>{let p=Math.round(a.present/a.total*100);return `<div class="attendance"><div class="item"><div><b>${esc(a.subject)}</b><div class="muted">${a.present}/${a.total} classes</div></div><b>${p}%</b></div><div class="bar"><i style="width:${Math.min(p,100)}%"></i></div></div>`}).join("")||"<p class='muted'>Add subjects.</p>";
}
function renderTimetable(){
 document.getElementById("todayClasses").innerHTML=data.timetable.slice(0,4).map(c=>`<div class="item"><div><b>${esc(c.subject)}</b><div class="muted">${c.day} · ${c.time}</div></div><span class="muted">${esc(c.room)}</span></div>`).join("")||"<p class='muted'>No classes.</p>";
 document.getElementById("timetableList").innerHTML=data.timetable.map(c=>`<div class="item"><div><b>${esc(c.day)} · ${esc(c.time)}</b><div class="muted">${esc(c.subject)} · ${esc(c.room)}</div></div></div>`).join("")||"<p class='muted'>No timetable entries.</p>";
}
function updateRecommendation(){
 const pending=data.tasks.filter(t=>!t.done).sort((a,b)=>priority(b.priority)-priority(a.priority)||String(a.deadline).localeCompare(String(b.deadline)));
 document.getElementById("recommendation").textContent=pending.length?`Your next recommended action is: “${pending[0].title}” (${pending[0].priority} priority).`:"You have no pending tasks. Great job — plan your next study goal!";
}
function priority(p){return p==="High"?3:p==="Medium"?2:1}
function toggleTask(id){let t=data.tasks.find(x=>x.id===id);if(t)t.done=!t.done;save();render()}
function openTaskForm(){document.getElementById("taskModal").classList.add("show");document.getElementById("taskTitle").focus()}
function closeTaskForm(){document.getElementById("taskModal").classList.remove("show")}
function saveTask(){
 const title=document.getElementById("taskTitle").value.trim(); if(!title)return alert("Enter a task title.");
 data.tasks.push({id:Date.now(),title,deadline:document.getElementById("taskDeadline").value,priority:document.getElementById("taskPriority").value,done:false});
 save();document.getElementById("taskTitle").value="";closeTaskForm();render();
}
function addAssignment(){
 const title=prompt("Assignment title:");if(!title)return;
 const subject=prompt("Subject:")||"General";const deadline=prompt("Deadline (YYYY-MM-DD):")||"";
 data.assignments.push({id:Date.now(),title,subject,deadline,status:"Pending"});
 data.tasks.push({id:Date.now()+1,title:`Work on: ${title}`,deadline,priority:"High",done:false});save();render();
}
function addAttendance(){
 const subject=prompt("Subject name:");if(!subject)return;
 const total=Number(prompt("Total classes:")||0),present=Number(prompt("Present classes:")||0);
 if(total>0)data.attendance.push({id:Date.now(),subject,present:Math.min(present,total),total});save();render();
}
function addClass(){
 const day=prompt("Day:");if(!day)return;const time=prompt("Time:")||"";const subject=prompt("Subject:")||"";const room=prompt("Room:")||"";
 data.timetable.push({id:Date.now(),day,time,subject,room});save();render();
}
function startRecommended(){
 const t=data.tasks.filter(t=>!t.done).sort((a,b)=>priority(b.priority)-priority(a.priority)||String(a.deadline).localeCompare(String(b.deadline)))[0];
 if(t){alert(`Focus mode started for:\\n\\n${t.title}\\n\\nSuggested session: 25 minutes.`)}else alert("No pending task. You can add a new goal.");
}
function askAI(q){
 const pending=data.tasks.filter(t=>!t.done).sort((a,b)=>priority(b.priority)-priority(a.priority)||String(a.deadline).localeCompare(String(b.deadline)));
 let msg;
 if(q.toLowerCase().includes("urgent")) msg=pending.filter(t=>t.priority==="High").map(t=>"• "+t.title).join("\n")||"No high-priority tasks.";
 else if(q.toLowerCase().includes("plan")) msg=pending.slice(0,5).map((t,i)=>`${i+1}. ${t.title} — ${t.priority}`).join("\n")||"No pending tasks.";
 else msg=pending[0]?`NEXT BEST TASK\\n\\n${pending[0].title}\\nPriority: ${pending[0].priority}\\nDeadline: ${pending[0].deadline||"not set"}\\n\\nStart a focused 25-minute session.`:"You are all caught up!";
 document.getElementById("aiMessage").textContent=msg;
}
function sendAI(){const v=document.getElementById("aiInput").value.trim();if(v)askAI(v)}
render();
