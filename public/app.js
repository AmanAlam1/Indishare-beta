const apiBase = ''  // relative URL; when deployed, backend serves static files and API on same domain
let token = null;
document.getElementById('requestOtp').onclick = async () => {
  const phone = document.getElementById('from').value;
  if(!phone){ alert('enter sender phone'); return; }
  const r = await fetch('/auth/request-otp', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({phone})});
  const j = await r.json();
  document.getElementById('otpSection').style.display = 'block';
  document.getElementById('result').innerText = 'OTP (demo): ' + j.otp;
};
document.getElementById('verifyOtp').onclick = async () => {
  const phone = document.getElementById('from').value;
  const otp = document.getElementById('otp').value;
  const r = await fetch('/auth/verify-otp', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({phone, otp})});
  const j = await r.json();
  if(j.access_token){
    token = j.access_token;
    document.getElementById('tokenArea').style.display = 'block';
    document.getElementById('result').innerText = 'Access token acquired (demo).';
  } else {
    document.getElementById('result').innerText = 'Verify failed: ' + JSON.stringify(j);
  }
};
document.getElementById('createTransfer').onclick = async () => {
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const bytes = parseInt(document.getElementById('bytes').value || '0');
  const r = await fetch('/transfers', {method:'POST', headers:{'content-type':'application/json', 'authorization':'Bearer '+token}, body:JSON.stringify({fromMsisdn:from, toMsisdn:to, bytes})});
  const j = await r.json();
  document.getElementById('result').innerText = 'Transfer response: ' + JSON.stringify(j);
};
