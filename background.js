chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
  	'id': 'timer',
    'bounds': {
      'width': 1015,
      'height': 600
    },
    minWidth: 1015,
    minHeight: 600
  });
});