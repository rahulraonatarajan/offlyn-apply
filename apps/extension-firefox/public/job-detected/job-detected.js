(function () {
  var params = new URLSearchParams(window.location.search);
  var tabId = parseInt(params.get('tabId') || '', 10);
  if (!tabId) {
    document.getElementById('job-title').textContent = 'No job info';
    return;
  }
  browser.runtime.sendMessage({ kind: 'GET_JOB_FOR_TAB', tabId: tabId }, function (response) {
    var lastJob = response && response.lastJob;
    if (lastJob) {
      document.getElementById('job-title').textContent = lastJob.title || 'Job application';
      var companyEl = document.getElementById('job-company');
      companyEl.textContent = lastJob.company ? 'at ' + lastJob.company : '';
      companyEl.style.display = lastJob.company ? '' : 'none';
      document.getElementById('job-hostname').textContent = lastJob.hostname || '';
    }
  });
  document.getElementById('btn-focus').addEventListener('click', function () {
    browser.tabs.get(tabId).then(function (tab) {
      browser.tabs.update(tabId, { active: true });
      browser.windows.update(tab.windowId, { focused: true });
      window.close();
    }).catch(function () {});
  });
  document.getElementById('link-onboarding').addEventListener('click', function (e) {
    e.preventDefault();
    browser.tabs.create({ url: browser.runtime.getURL('onboarding/onboarding.html') });
    window.close();
  });
})();
