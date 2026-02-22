(function () {
  var statusEl = document.getElementById('status');
  var retryBtn = document.getElementById('retry-btn');
  var resumeText = document.getElementById('resume-text');
  var parseBtn = document.getElementById('parse-btn');
  var resultEl = document.getElementById('result');
  var fileInput = document.getElementById('file-input');
  var loadTxtBtn = document.getElementById('load-txt');

  function setResult(text, isError) {
    resultEl.textContent = text || '';
    resultEl.className = 'result ' + (isError ? 'error' : text ? 'success' : 'empty');
  }

  function setStatus(connected, lastError, source) {
    var label = (source === 'clawd') ? 'Clawd' : 'Ollama / Native host';
    if (connected) {
      statusEl.textContent = label + ': Connected';
      statusEl.className = 'status connected';
      retryBtn.style.display = 'none';
    } else {
      statusEl.textContent = label + ': Disconnected' + (lastError ? ' — ' + lastError : '');
      statusEl.className = 'status disconnected';
      retryBtn.style.display = 'inline-block';
    }
  }

  var statusTimeout = null;
  function pollStatus() {
    if (statusTimeout) clearTimeout(statusTimeout);
    statusEl.textContent = 'Checking connection…';
    statusEl.className = 'status disconnected';
    retryBtn.style.display = 'none';
    statusTimeout = setTimeout(function () {
      statusTimeout = null;
      if (statusEl.textContent === 'Checking connection…') {
        setStatus(false, 'Timed out (no response from extension). Click Retry connection or reload this page.', 'native');
      }
    }, 4000);
    browser.runtime.sendMessage({ kind: 'GET_CONNECTION_STATUS' }, function (r) {
      if (statusTimeout) { clearTimeout(statusTimeout); statusTimeout = null; }
      if (browser.runtime.lastError) {
        setStatus(false, browser.runtime.lastError.message || 'Extension error', 'native');
        return;
      }
      if (r == null) {
        setStatus(false, 'No response. Reload this page or the extension.', 'native');
        return;
      }
      setStatus(Boolean(r.connected), r.lastError || null, r.source || 'native');
    });
  }

  retryBtn.addEventListener('click', function () {
    browser.runtime.sendMessage({ kind: 'RECONNECT_NATIVE_HOST' }).then(function () {
      setTimeout(pollStatus, 600);
    });
  });

  loadTxtBtn.addEventListener('click', function () { fileInput.click(); });
  fileInput.addEventListener('change', function () {
    var f = fileInput.files && fileInput.files[0];
    if (!f) return;
    var reader = new FileReader();
    reader.onload = function () { resumeText.value = reader.result || ''; };
    reader.readAsText(f, 'utf-8');
    fileInput.value = '';
  });

  parseBtn.addEventListener('click', function () {
    var text = resumeText.value.trim();
    if (!text) {
      setResult('Paste resume text or load a .txt file first.', true);
      return;
    }
    parseBtn.disabled = true;
    resultEl.textContent = 'Parsing…';
    resultEl.className = 'result empty';
    var requestId = 'parse-' + Date.now();
    browser.runtime.sendMessage({
      kind: 'PARSE_RESUME',
      resumeText: text,
      requestId: requestId,
      previousExtracted: null,
      previousSaved: null
    }, function (response) {
      parseBtn.disabled = false;
      var err = browser.runtime.lastError && browser.runtime.lastError.message;
      if (err) {
        setResult('Error: ' + err, true);
        setStatus(false, err);
        return;
      }
      if (response == null) {
        setResult('No response. Is the native host installed? Restart Firefox after installing.', true);
        return;
      }
      if (response.error) {
        setResult('Error: ' + response.error, true);
        return;
      }
      var extracted = response.extracted || {};
      setResult(JSON.stringify(extracted, null, 2), false);
    });
  });

  pollStatus();
  setInterval(pollStatus, 8000);
})();
