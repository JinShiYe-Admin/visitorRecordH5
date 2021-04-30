var REM = parseFloat(localStorage.getItem("REM"));
if(REM){
	document.documentElement.style.fontSize = REM + 'px';
}else{
	setRem(document, window);
}

//设置rem, 1rem = 100px
function setRem(doc, win){
	var docEl = doc.documentElement,
        resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
        recalc = function () {
            var clientWidth = docEl.clientWidth>750?750:docEl.clientWidth;
            if (!clientWidth) return;
            REM = 100 * (clientWidth / 375); //设计图中 100px=1rem
            docEl.style.fontSize = REM + 'px';
            localStorage.setItem("REM", REM);
        };
    if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);
}

// 获取套餐学段名
function getPrdName(fx) {
	var names = [];
	fx && fx.forEach(function(v){
		if(v.itemcode=="prd"){
			var values = v.itemsons.split(",");
			for(var i=0;i<values.length;i++){
				var fv = values[i].split("|").pop();
				if(fv) names.push(fv);
			}
		}
	});
    return  names;
}

//分数格式
function setWordsScore(score) {
	return Math.round(score*20);
}

//选择教材
function goBook() {
	mui.openWindow({
		url: "book.html",
		id: "book.html",
		waiting: {
			autoShow:false,
			title:'正在加载...'
		}
	});
}

//打开记录
function goRecord(activeTab) {
	mui.openWindow({
		url: "record.html",
		id: "orals_record",
		extras: {
			category: activeTab=="word"?"read_word":"read_sentence"
		},
		waiting: {
			autoShow:false,
			title:'正在加载...'
		}
	});
}

//打开结果页
function goResult(extras) {
	mui.openWindow({
		url: "result.html",
		id: "result.html",
		extras: extras,
		waiting: {
			autoShow:true
		}
	});
}

//获取教材名
function getBookNames() {
	var orals_menu = store.get("orals_menu");
	return orals_menu.name||"";
}

// 检查确保教材的selected是否都在list中
function bookCheck(book) {
	for(var key  in book) {
		var selected="";
		for(var i=0; i<book[key].list.length; i++) {
			if(book[key].list[i][key+"code"]==book[key].selected) {
				selected = book[key].list[i][key+"code"];
				break;
			}
		}
		if(!selected) book[key].selected = book[key].list[0]?book[key].list[0][key+"code"]:"";
	}
	return book;
}
// 获取教材code
function getBookCodes(book) {
	var codes = {};
	for(var key  in book) {
		if(key=="per"||key=="sub"||key=="mater"||key=="fasc") {
			if(book[key].selected) codes[key+"code"] = book[key].selected;
		}
	}
	return codes;
}

//获取目录名
function getCatalogName(id) {
	var catalog = store.get('orals_catalog');
	var cur_node = filterArray(catalog, 'id', id)[0];
	var final_name = "";
	if(cur_node) {
		final_name = cur_node.pid?((cur_node.pname||"")+"&nbsp;&nbsp;"+cur_node.name):cur_node.name;
	}
	return final_name;
}

//获取最末端目录
function getFinalCatalog(list){
	var catalog = []; 
	readTree(list, function(node){
        if(!node.children) {
            catalog.push(node);
        }
   	});
   	catalog.forEach(function(v, i){
		readTree(list, function(node){
			if(node.id==v.pid){
				catalog[i]["pname"] = node.name;
			}
		});
	});
	return catalog;
}

//获取 上级+下级 目录节点
function getSubNode(id) {
	var menu = store.get("orals_menu");
	var catalog = store.get('orals_catalog');
	var cur_node = filterArray(catalog, 'id', id)[0];
	var p_node;
	readTree(menu, function(node){
		if(node.id==cur_node.pid) p_node=node; 
	});
	return {node: cur_node, parentNode: p_node};
}

// 根据某属性的值找数组对象
function filterArray(arr, key, val) {  
    var r = arr.filter(function(item){
            return item[key] == val;
        });
    return r;
}

// 遍历树形菜单，并回调
function readTree(tree, callback) {
    for (var i = 0; i < tree.length; i++) {
        callback(tree[i]);
        if(tree[i].children) {
            readTree(tree[i].children, callback);
        }
    }
}

//监听上拉刷新，el被监听的元素
function setPullRefresh(el, callback) {
	var startX, startY;
	refreshBox = document.querySelector(el);
	if(refreshBox){
		refreshBox.addEventListener('touchstart',function (ev) {
            startX = ev.touches[0].pageX;
            startY = ev.touches[0].pageY;
        }, false);
        refreshBox.addEventListener("touchend", function(ev){
        	var endX, endY;
            endX = ev.changedTouches[0].pageX;
            endY = ev.changedTouches[0].pageY;
            var direction = GetSlideDirection(startX, startY, endX, endY);
			// console.log(this.scrollHeight+"---"+this.scrollTop);
            if(direction==1&&(this.scrollHeight<=this.scrollTop+this.clientHeight)) {
            	callback();
            }
        }, false);
		if(mui.os.android&&parseFloat(mui.os.version)<6.0){
			refreshBox.addEventListener("touchcancel", function(ev){
			 	var endX, endY;
			     endX = ev.changedTouches[0].pageX;
			     endY = ev.changedTouches[0].pageY;
			     var direction = GetSlideDirection(startX, startY, endX, endY);
			 	// console.log(this.scrollHeight+"---"+this.scrollTop);
			     if(direction==1&&(this.scrollHeight<=this.scrollTop+this.clientHeight)) {
			     	callback();
			     }
			 }, false);
		}
	}
}

//滑动方向
function GetSlideDirection(startX, startY, endX, endY) {
    var dy = startY - endY;
    //var dx = endX - startX;
    var result = 0;
    if(dy>0) {//向上滑动
        result=1;
    }else if(dy<0){//向下滑动
        result=2;
    }
    else
    {
        result=0;
    }
    return result;
}

// 上传录音
function uploadRecordFile(record, fs, params,callback) {
	checkNewWork(function() {
		mui.toast("网络异常，请检查网络设置！", {duration:'long', type:'div'});
	});
	
	record.words = record.words?record.words.trim():record.words;
	
	var wt=plus.nativeUI.showWaiting("正在评分");
	
	var personal = store.get(window.storageKeyName.PERSONALINFO)||{};
	
	var task=plus.uploader.createUpload(window.storageKeyName.INTERFACE_KYCP + "/pub/upload",
		{
			method:"POST",
		},
		function(t,status){ //上传完成
			if(status==200){
				var res;
				try{
					res = JSON.parse( t.responseText );
				}catch(e){
					res = {}
				}
				if(res.state=="ok") {
					// console.log(t.responseText)
					fs = [];
					// 评分
					postDataEncry(window.storageKeyName.INTERFACE_KYCP + '/orals/record', {}, {
						data: record,
						file_url: res.data.url,
						index_code: params.index_code,
						user_code: userInfo.user_code
					}, 2, function(r) {
						if(r.state=="ok") {
							callback(r);
						}else{
							if(r.code!=404) mui.toast(r.msg||"评分失败，请重试", {duration: "short", type: "div"});
						}
						wt.close();
					})
				}else{
					wt.close();
					// res.code=='sup6' || res.code=='0006' token过期
					tokenReset(res, function() {
						uploadRecordFile(record, fs, params,callback);
					}, function() {
						fs = [];
						mui.toast(res.msg||"评分失败，请重试", {duration: "short", type: "div"});
					});
				}
			}else{
				fs = [];
				wt.close();
				mui.toast("评分失败，请重试", {duration: "short", type: "div"});
			}
			
		}
	);
	
	for(var i=0;i<fs.length;i++){
		var f=fs[i];
		task.addFile(f.path,{key:f.name});
	}
	task.addData("platform_code", personal.platform_code);
	task.addData("app_code", personal.app_code);
	task.addData("unit_code", personal.unit_code);
	task.addData("index_code", params.index_code);
	task.addData("access_token", personal.access_token);
	// 生成sign
	var signTemp = postDataEncry1({}, {
		index_code: params.index_code
	}, 2);
	signHmacSHA1.sign(signTemp, 'jsy309', function(sign) {
		task.addData("sign", sign);
		task.start();
	});
}

// 设置录音器
function setRecorder(touch, success, fail) {
	var recorder = plus.audio.getRecorder();
	
	//长按是否有效
	var touchTimer = setTimeout(function(){
		touch = true;
	}, 500);
	var samp = "16000";
	recorder.record({filename:'_doc/audio/', samplerate: samp}, function(p){
		//录音完成
		if(touch) {
			plus.io.resolveLocalFileSystemURL(p, function(entry){
				success(p);
			}, function(e){
				console.log('读取录音文件错误：'+e.message);
			});
		}
		clearTimeout(touchTimer);
		touch = false;
	}, function(e){
		fail&&fail();
		checkPermissionRECORD();
		clearTimeout(touchTimer);
		touch = false;
	});
	return recorder;
}
// 检查录音权限
function checkPermissionRECORD(success) {
	var rdps = plus.navigator.checkPermission("RECORD");
	// console.log(rdps)
	if(["authorized","notdeny"].indexOf(rdps)!=-1){
		success && success();
	} else {
		if(rdps=="denied"){
			plus.nativeUI.confirm("录音已被禁用，请设置为允许。", function(event) {
				if(event.index===0) {
					plus.runtime.launchApplication({
						action: 'App-Prefs:root='
					}, function(e) {});
				}
			}, {buttons: ["去设置","取消"]});
		}else{
			var recorder_check = plus.audio.getRecorder();
			recorder_check.record({filename:"_doc/audio/"},function(){});
			recorder_check.stop();
		}
	}
}

function netErrorTip() {
	var net_abort_html = '<div class="net-error-box">'+
		'<svg class="icon" aria-hidden="true"><use xlink:href="#icon-icon-net-error"></use></svg>'+
		'<div style="padding: 0.14rem;">页面加载异常，点击重试</div>'+
		'<button type="button" onclick="reload()">重新加载</button>'+
	'</div>';
	$(".mui-content").html("").append(net_abort_html);
}

function reload() {
	window.location.reload();
}

//时间比较
function compareDate(d1,d2){
	return ((new Date(d1.replace(/-/g,"\/")))>(new Date(d2.replace(/-/g,"\/"))));
}

//续订
function tokenReset(res, resetCallback, failCallbck){
	//令牌过期
	if (res.code == 6 || res.code == 'sup6' || res.code == '0006' || res.code == 'sup_0006') { 
		var publicPar = store.get(window.storageKeyName.PUBLICPARAMETER);
		var personal = store.get(window.storageKeyName.PERSONALINFO);
		var tempToken = {
			index_code: 'index',
			user_code: personal.user_code, //登录名
			uuid: publicPar.uuid, //设备唯一识别码,防同一应用在不同机器上登录互串,验证码校检用
			webid: publicPar.webid, //浏览器识别码,防不同浏览器登录同一应用互串,验证码校检用（web用浏览器类型加版本，app用操作系统+版本））
			device_type: '1' //登录设备类型，0：WEB、1：APP、2：客户端
		}
		//令牌续订
		postDataEncry(window.storageKeyName.INTERFACE_SSO_SKIN + 'token/refresh', {}, tempToken, 2, function(data1) {
			if (data1.code == 0) {
				var tempInfo00 = store.get(window.storageKeyName.PERSONALINFO);
				tempInfo00.access_token = data1.data.access_token;
				store.set(window.storageKeyName.PERSONALINFO, tempInfo00);
				var urlArr = url.split('/');
				var tempData = JSON.parse(data);
				tempData.access_token = data1.data.access_token;
				delete tempData.sign;

				postDataEncry(url, {}, tempData, 0, function(data2) {
					data2 = modifyParameter(url, data2);
					resetCallback(data2);
				});
			} else {
				mui.toast(data1.msg);
			}
		});
	} else if(res.code == 'sup_0015') {
		mui.toast(success_data.msg);
		//获取个人信息
		var personal = store.get(window.storageKeyName.PERSONALINFO);
		//设置app角标,flag=0直接设置角标数字，flag=1角标减1,falg=2角标加1
		utils.setBadgeNumber(0, 0);
		
		//获取所有已打开的webview 实例————重新打开login.html————循环关闭页面
		store.remove(window.storageKeyName.PERSONALINFO);
		plus.webview.open('../../html/login/loginIndex.html', '../../html/login/loginIndex.html', {
			statusbar: {
				background: "#00CFBD"
			}
		});
		// utils.mOpenWithData("../../html/login/loginIndex.html", {});
		var curr = plus.webview.currentWebview();
		var wvs = plus.webview.all();
		try {
			for (var i = 0, len = wvs.length; i < len; i++) {
				//关闭除login页面外的其他页面
				if (wvs[i].getURL().indexOf('loginIndex.html') != -1) {
					continue;
				}
				plus.webview.close(wvs[i]);
			}
		} catch (e) {
			console.log(e)
		}
		curr.close();
		events.closeWaiting();
	} else {
		failCallbck(res);
	}
}

//获取认证信息
function getAuth() {
	var userInfo = store.get(window.storageKeyName.PERSONALINFO);
	var deviceParam = store.get(window.storageKeyName.PUBLICPARAMETER);
	return {
		uuid: deviceParam.uuid,
		user_code: userInfo.user_code,
		unit_code: userInfo.unit_code,
		access_token: userInfo.access_token,
		app_code: userInfo.app_code,
		platform_code: userInfo.platform_code
	}
}

// 播放音频
var plusAudioPlayer = null;
function audioPlayer(url, callback) {
	if(plusAudioPlayer) {
		// plusAudioPlayer.stop();
		plusAudioPlayer.close();
	}
	plusAudioPlayer = plus.audio.createPlayer(url);
	plusAudioPlayer.play(function() {
		callback && callback();
	}, function() {
		const urls = url.split('?');
		CloudFileUtil.getQNDownToken(window.storageKeyName.QNGETDOWNTOKENFILE, {
			appId: window.storageKeyName.QN_APPID, 
			appKey: window.storageKeyName.QN_APPKEY,
			urls: [urls[1] ? urls[0] : url] 
		}, function(data) {
			var urlStr = encodeURI(data.Data[0].Value);
			plusAudioPlayer = plus.audio.createPlayer(urlStr);
			plusAudioPlayer.play(function() {
				callback && callback();
			}, function() {
				callback && callback();
			});
		}, function(xhr, type, errorThrown) {
			mui.toast('获取音频失败 ' + type);
		});
	});
}