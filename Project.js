// Voice Recording Code
const startBtn=document.getElementById("startBtn");
const stopBtn=document.getElementById("stopBtn");
const audioPlayer=document.getElementById("audioPlayer");
let mediaRecorder;
let audioChunks=[];
startBtn.addEventListener("click",startRecording);
stopBtn.addEventListener("click",stopRecording);
function startRecording(){
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        alert("Your browser does not support audio recording.");
        return;
    }
    navigator.mediaDevices.getUserMedia({audio:true})
    .then((stream)=>{
        audioChunks=[];
       mediaRecorder=new MediaRecorder(stream);
       mediaRecorder.ondataavailable=(event)=>{
        if(event.data.size>0){
            audioChunks.push(event.data);
        }
       };
       mediaRecorder.onstop=()=>{
        audioBlob=new Blob(audioChunks,{type:'audio/wav'});
        audioPlayer.src=URL.createObjectURL(audioBlob);
       };
       mediaRecorder.start();
       startBtn.disabled=true;
       stopBtn.disabled=false;
    })
    .catch((error)=>{
     console.error("error in microphone",error);
     alert("could not access your microphone");
    });
}
function stopRecording(){
    if(mediaRecorder && mediaRecorder.state==="recording"){
        mediaRecorder.stop();
        startBtn.disabled=false;
        stopBtn.disabled=true;
    }
  }

//Formdata

let alertTimeout;
const box=document.getElementById("box");
const submitBtn=document.getElementById("submitBtn");
submitBtn.addEventListener("click",()=>{
navigator.geolocation.getCurrentPosition((position)=>{
const latitude=position.coords.latitude;
const longitude=position.coords.longitude;
alertTimeout=setTimeout(async ()=>{
const name=document.getElementById("name");
const contact=document.getElementById("contact");
const sms=document.getElementById("sms");
const formData=new FormData();
formData.append("name",name.value);
formData.append("contact",contact.value);
formData.append("sms",sms.value);
formData.append("latitude",latitude);
formData.append("longitude",longitude);
if(audioBlob){
    formData.append("audio",audioBlob,"recording.wav");
}else{
    alert("Audio not recorded yet!");
    return;
}
try{
const response=await fetch("http://localhost:5000/send-alert",{
method:"POST",
body:formData,   
}) ;
if (!response.ok) throw new Error("Server error");
const result=await response.json();
console.log("result sending alert: ",result);
alert(result.message);
box.innerHTML="Your Alert is sent successfully !";
box.style.color="rgb(0,255,0)";
box.style.backgroundColor="white"; 
box.style.fontWeight="bold";
} catch(error){
console.log("Error sending alert:",error);
alert("Failed to send alert");
box.innerHTML="Your Alert is not sent successfully !";
box.style.color="rgb(255,0,0)";
box.style.backgroundColor="white"; 
box.style.fontWeight="bold";
}
},2000);
});
});

//Onclicking cancel Button , Alert is not sent

const cancelBtn=document.getElementById("cancelBtn");
cancelBtn.addEventListener("click",()=>{
    clearTimeout(alertTimeout);
});
