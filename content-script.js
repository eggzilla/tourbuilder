'use strict';
var recording = false;
var nbSteps = 1;
var defaultContent = '\nid: new-tour\nname: NewTour\ndescription: Hello, this is a new tour!\ntitle_default: "New Tour"\n\nsteps:';

window.browser = (function () {
  return window.msBrowser ||
    window.browser ||
    window.chrome;
})();

function toggleTourRecording(toggle){
    recording = toggle;
}


function notifyExtension(event) {
    if (recording){
        if ('tour-toggle' === event.target.id) {
            var h = $('#tour-config').css('height');
            $('#tour-config').css('height', '20px' === h ? '200px' : '20px');
            return;
        };
        var path = $(event.target).domPath().join('');
        if (!/tour-configurator/.test(path)) {
            addStep(path);
        }
    }
}

function addStep(path) {
    var $text = $('#tour-textarea');
    var content = $text.val();
    var tour_config_patt = new RegExp("tour-config");
    var uid_patt = new RegExp("uid");
    if (path !== lastPath && '' !== path && !tour_config_patt.test(path) && !uid_patt.test(path)) {
        var tour_link_patt = new RegExp("tool-link");
        content = content + '\n  - title: \'Step ' + nbSteps++ + '\'\n    content: \'\'\n    placement: \'\'\n    '
        if (!tour_link_patt.test(path)) {
          content = content + 'element: \'' + path + '\'\n    postclick: \n      - ' + path + '\n';
        } else {
          var tool_regex = /> a.(.*?).tool-link/g;
          var match = tool_regex.exec(path);
          var link = 'a[href$="/tool_runner?tool_id=' + match[1] + '"]';
          content = content + 'position: \'right\'\n    preclick: \n      - \'' + link + '\'\n    postclick: \n      - \'#execute\'\n';
        }
        
        lastPath = path;
    }
    $text.val(content);
};

window.addEventListener("click", notifyExtension);
window.browser.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
  if (msg.action == 'toggle_tour_record') {
      if (msg.value === true && !$('#tour-config').length) {
        $('body').append('\n    <div style="position: absolute; bottom: 0; height: 200px; width: 100%; z-index: 1000;" id="tour-config">\n      <button id="tour-toggle">toggle</button>\n      <textarea style="width: 100%; height: 100%;" id="tour-textarea">' + defaultContent + '</textarea>\n    </div>');
      };
      toggleTourRecording(msg.value);
  }
});
