/* author: lynne
 *  time: 2017.9.4
 */

//判断环境
function platformFn() {
  var _platform = {};
  var ua = navigator.userAgent;

  var isWebkit = false;
  if (/AppleWebKit\/\d+\.\d+/.test(ua)) {
    isWebkit = true;
  }

  var isAndroid = false;
  if (/Android (\d+\.\d+)/.test(ua)) {
    isAndroid = true;
  }

  var isInWechat = false;
  var isInMqzone = false;
  var isInMqq = false;
  if (/MicroMessenger/.test(ua)) {
    isInWechat = true;
  } else if (/Qzone/.test(ua)) {
    isInMqzone = true;
  } else if (/QQ\/\d+\.\d+\.\d+\.\d+/.test(ua)) {
    isInMqq = true;
  }

  var isPc = !isAndroid;
  if (isPc) {
    var Agents = ["iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    for (var v = 0; v < Agents.length; v++) {
      if (ua.indexOf(Agents[v]) > 0) {
        isPc = false;
        break;
      }
    }
  }

  _platform.isAndroid = isAndroid;
  _platform.isWebkit = isWebkit;
  _platform.isInWechat = isInWechat;
  _platform.isInMqzone = isInMqzone;
  _platform.isInMqq = isInMqq;
  _platform.isPc = isPc;

  return _platform;
}

var MEDIA = MEDIA || {};

// 创建video类
MEDIA.video = (function() {
  var platform = platformFn();
  // 数据初始化
  var video = function(options) {
    if (!options || typeof options !== 'object') {
      return;
    }
    this.url = options.url; //视频文件地址
    this.poster = options.poster; //视频封面
    this.btnPoster = options.btnPoster; //按钮\
    // this.loop = options.loop;

    this.create();
  };

  video.prototype.create = function() {
    // 添加背景
    this.setBg();
    // 添加视频元素
    this.setVideoEle();
  };

  // 添加背景
  video.prototype.setBg = function() {
    var videoBox = $('<div class="video_box" id="video_box">' +
      '<img class="video_bg" src="' + this.poster + '">' +
      '<div class="video_btn">' +
      '<img class="video_btnbg" src="' + this.btnPoster + '">' +
      '</div>' + '</div>')
    $('#video_layer').append(videoBox);
  };

  // 添加视频元素
  video.prototype.setVideoEle = function() {
    var videoEle;
    if (platform.isPc) {
      // pc还是flash比较好吧
      videoEle = '<video width=1 preload=auto controls src="' + this.url + '"></video>';
    } else {
      videoEle = '<video width=1 preload=auto webkit-playsinline playsinline src="' +
        this.url + '"></video>';
    };
    var media = $(videoEle);

    // 微信全屏去掉控制条
    if (platform.isInWechat) {
      media.attr('x5-video-player-type', 'h5');
      media.attr('x5-video-player-fullscreen', 'true'); //加这个有什么用呢
      media.attr('x5-video-orientation', 'portraint');
    }

    if (this.loop) {
      media.attr('loop', 'loop');
    }

    if (!platform.isPc) {
      $('#video_box').on('touchstart', '.video_btn', function(event) {
        $('#video_layer').append(media);
      });
      $('#video_box').on('click', '.video_btn', function(event) {
        media[0].play();
        media.css({
          width: '100%'
        });
        $(this).parent().hide();
      });
    } else {

      $('#video_box').on('click', '.video_btn', function(event) {
        $('#video_layer').append(media);
        media[0].play();
        media.css({
          width: '100%'
        });
        $(this).parent().hide();
      });
    }
  };

  // 获取下载进度
  video.prototype.getProgress = function(media) {
    // 获取视频已经下载的时长
    function getEnd(media) {
      var end = 0;
      try {
        end = media.buffered.end(0) || 0;
        end = parseInt(end * 1000 + 1) / 1000;
      } catch (e) {
        console.log('getEnd:' + e);
      }
      return end;
    }

    // 播放时长
    var duration = media.duration || 0;

    var end = getEnd(media);
    var progress;

    if (end < duration) {
      progress = end / duration;
    } else {
      progress = 1;
    }
    // 设置控制条
    return progress;
  };

  // 定时监听下载进度
  video.prototype.setProgress = function function_name(media) {
    // 设置定时器定时监控
    var timer = setInterval(function() {
      var progress = getProgress(media);

      if (progress < 1) {
        return;
      }

      clearInterval(timer);
    }, 1000);
  };

  // 统计播放时间和次数
  video.prototype.caculate = function(media) {
    media.on('playing', function() {
      // 开始播放时打点
      media.attr('data-updateTime', +new Date())
    })

    media.on('pause', function() {
      // 暂停播放时清除打点
      media.removeAttr('data-updateTime')
    })

    // 累加播放时间
    media.on('timeupdate', function(event) {
      var media = $(event.target)[0],
        updateTime = parseInt(media.attr('data-updateTime') || 0),
        playingTime = parseInt(media.attr('data-playingTime') || 0),
        now = +new Date();

      // 播放时间
      playingTime = playingTime + now - updateTime;

      media.attr('data-playingTime', playingTime);
      media.attr('data-updateTime', now);

      // 播放时长
      var duration = media.duration || 0;
      // 播放次数
      var playCount = Math.ceil(playingTime / 1000 / duration)
    })
  }

  return video;
})();
