/**
 * Created by JavieChan on 2016/12/27.
 * Updated by JavieChan on 2017/05/16.
 */

;(function($){
    var portalfn = function(ele, options){
        this.$ele = ele;
        this.defaults = {
            user: options.user,
            password: options.password,
            openid: '',
            ac_ip: '',
            vlanId: '',
            ssid: '',
            user_ip: '',
            user_mac: '',
            ap_mac: '',
            firsturl: '',
            urlparam: '',
            appid: '',
            shopid: '',
            pn: '',
            policy: 1024,

            ismobile: true,

            isuser: false,
            ispwd: false,
            isterm: true,
            isname: true,

            auto: false
        };
        this.opt = $.extend({}, this.defaults, options);
    };
    portalfn.prototype.init = function(){
        var self = this;
        self.$user = self.$ele.find('input[name=user]');
        self.$pwd = self.$ele.find('input[name=password]');
        self.$name = self.$ele.find('input[name=name]');
        self.$yzm = self.$ele.find('#yzm');
        self.$login = self.$ele.find('#login');
        self.$autoUser = self.$ele.find('#autoLogin');
        self.isyzm = false;
        self.checkIsyzm();
        self.InputInit();
        self.InputHandle();
        self.loginHandle();
        self.downMacsHandle();
        self.changePasswordHandle();
        if(self.opt.auto){
            self.autoAccountHandle();
        }
    };
    portalfn.prototype.autoAccountHandle = function(){
        var self = this;
        $(document).on('click', '#autoAccount', function(){
            var obj = {
                user: self.defaults.user,      // 55532
                password: self.defaults.password,    // 987012
                openid: self.opt.openid,
                ac_ip: self.opt.ac_ip,
                vlanId: self.opt.vlanId,
                ssid: self.opt.ssid,
                user_ip: self.opt.user_ip,
                user_mac: self.opt.user_mac,
                ap_mac: self.opt.ap_mac,
                firsturl: self.opt.firsturl,
                urlparam: self.opt.urlparam,
                appid: self.opt.appid,
                shopid: self.opt.shopid
            };

            $(this).attr('disabled', true);
            self.accountHandle(obj, true);

            //accountAjax(obj, function(data){
            //    window.location.href= self.urlChange('${firsturl}', '${urlparam}');
            //}, function(xmlhttp, status){
            //    if(status=='timeout'){
            //        alert('认证超时，请重新认证！');
            //    }
            //}, function(error){
            //    try{
            //        alert('验证失败：'+error.responseJSON.Msg);
            //    }catch(e) {
            //        alert('验证失败，请重新认证！');
            //    }
            //});
        });
    };
    portalfn.prototype.checkIsyzm = function(){
        var self = this;
        if( ((self.opt.policy>>10 & 1) & (self.opt.policy>>8 & 1)) > 0 ){
            self.isyzm = false;
            self.getYzm();
        }else if( (self.opt.policy >> 10 & 1) > 0 ){
            self.isyzm = true;
            self.getYzm();
        }else if( (self.opt.policy >> 8 & 1) > 0 ){
            self.isyzm = false;
        }
    };
    portalfn.prototype.InputHandle = function(){
        var self = this;
        self.$user.bind('input propertychange', function() {
            self.opt.user = $.trim($(this).val());
            self.opt.isuser = (!!self.opt.user);
            //if(self.opt.isuser){
            //    $(this).parents('.inputWrapper').removeClass('borderRed');
            //}
            self.InputAble(self.opt.isuser, self.opt.ispwd, self.opt.isterm, self.opt.isname);

            self.changeInputType();
        });
        self.$pwd.bind('input propertychange', function() {
            self.opt.password = $.trim($(this).val());
            self.opt.ispwd = (!!self.opt.password);
            //if(self.opt.ispwd){
            //    $(this).parents('.inputWrapper').removeClass('borderRed');
            //}
            self.InputAble(self.opt.isuser, self.opt.ispwd, self.opt.isterm, self.opt.isname);
        });
        self.$name.bind('input propertychange', function() {
            var name = $.trim($(this).val());
            self.opt.isname = (!!name);
            //if(self.opt.isname){
            //    $(this).parents('.inputWrapper').removeClass('borderRed');
            //}
            self.InputAble(self.opt.isuser, self.opt.ispwd, self.opt.isterm, self.opt.isname);
        });
        $('.chkcls').on('click', function(){
            if($(this).find('i').hasClass('chk')){
                $('.chkcls i').addClass('unchk').removeClass('chk');
                $('#weixinAuthor').attr('disabled', true);
                self.opt.isterm = false;
                self.InputAble(self.opt.isuser, self.opt.ispwd, self.opt.isterm, self.opt.isname);
            }else{
                $('.chkcls i').addClass('chk').removeClass('unchk');
                $('#weixinAuthor').attr('disabled', false);
                self.opt.isterm = true;
                self.InputAble(self.opt.isuser, self.opt.ispwd, self.opt.isterm, self.opt.isname);
            }
        });
        $(document).on('click', '.term a', function(){$('.termWrapper').fadeIn()});
        $(document).on('click', '#termCheck', function(){$('.termWrapper').fadeOut()});

        $('#autoDuty input').change(function(){
            if($(this).is(':checked')){
                $('#weixinAuthor').attr('disabled', false);
            }else{
                $('#weixinAuthor').attr('disabled', true);
            }
        });
    };
    portalfn.prototype.changeInputType = function(){
        var self = this;
        if( ((self.opt.policy>>10 & 1) & (self.opt.policy>>8 & 1)) > 0 ){
            if( /^1\d{10}$/.test(self.opt.user) ){
                self.isyzm = true;
                self.$pwd.attr('type', 'text');
                self.$yzm.show();
            }else{
                self.isyzm = false;
                self.$pwd.attr('type', 'password');
                if(!self.$yzm.hasClass('sYzm'))
                    self.$yzm.hide();
            }
        }
    };
    portalfn.prototype.InputAble = function(isuser, ispwd, isterm, isname){
        var self = this;
        self.$ele.find('#login, #infoCheck').attr('disabled', true);
        if(isname && isuser){
            self.$ele.find('#infoCheck').attr('disabled', false);
        }
        if(isname && isuser && ispwd && isterm){
            self.$login.attr('disabled', false);
        }
    };
    portalfn.prototype.InputInit = function(){
        var self = this;
        if(self.$autoUser.length>0){
            var name = self.$autoUser.data('name');
            var user = localStorage[name];
            if(!!user){
                self.opt.user = user;
                self.$user.val(user);
                self.opt.isuser = true;
                self.$autoUser.find('input[type=checkbox]').attr('checked', true);

                self.changeInputType();
            }
        }
        if(self.$user.val()=='' || (self.$name.length>0 && self.$name.val()=='') ){
            self.$ele.find('#infoCheck').attr('disabled', true);
        }
        if(self.$user.val()=='' || self.$pwd.val()=='' || (self.$name.length>0 && self.$name.val()=='') ){
            self.$login.attr('disabled', true);
        }
    };
    portalfn.prototype.getYzm = function(){
        var self = this;
        self.$yzm.on('click', function(e){
            e.stopPropagation();
            if( !(/^1\d{10}$/.test(self.opt.user)) ){
                alert('请输入正确的手机号');return false;
            }
            if(canyzm){
                var param = {
                    mobile: self.opt.user,
                    mask: 256,
                    pn: self.opt.pn
                };
                $('.loading').show();
                getYzmAjax(param, function(data){
                    $('.loading').hide();
                    verify = data.verify;
                    alert("验证码已下发到手机，请注意查收！");
                    self.$yzm.html('<span>60</span>秒重新获取').attr('disabled', true);
                    delayYZM();
                },function(err){
                    showMsg('请检查网络状态');
                });
            }
        });
    };
    portalfn.prototype.loginHandle = function(){
        var self = this;
        self.$login.on('click', function(){
            var obj = {
                user: self.opt.user,
                password: self.opt.password,
                openid: self.opt.openid,
                ac_ip: self.opt.ac_ip,
                vlanId: self.opt.vlanId,
                ssid: self.opt.ssid,
                user_ip: self.opt.user_ip,
                user_mac: self.opt.user_mac,
                ap_mac: self.opt.ap_mac,
                firsturl: self.opt.firsturl,
                urlparam: self.opt.urlparam,
                appid: self.opt.appid,
                shopid: self.opt.shopid
            };

            //if(!self.opt.user){self.$user.focus().parents('.inputWrapper').addClass('borderRed');return false;}
            //if(!self.opt.password){self.$pwd.focus().parents('.inputWrapper').addClass('borderRed');return false;}
            //if(!self.opt.name){self.$name.focus().parents('.inputWrapper').addClass('borderRed');return false;}
            //$('.inputWrapper').removeClass('borderRed');

            if($('#autoDuty').length>0 && (!$('#autoDuty input').is(':checked'))){
                alert('需同意无线上网业务免责声明！');return false;
            }
            if (self.isyzm) {
                if (self.MD5yzm(self.opt.password) == verify) {
                    var param = {
                        mobile: self.opt.user,
                        mask: 256,
                        mac: self.opt.ap_mac
                    };
                    registerAjax(param, function(data){
                        self.opt.user = data.user;
                        obj.user = data.user;
                        obj.password = data.password;
                        self.$login.text('正在验证').attr('disabled', true);
                        self.accountHandle(obj);
                    });
                } else {
                    alert('验证码错误');
                }
            } else {
                self.$login.text('正在验证').attr('disabled', true);
                self.accountHandle(obj, false);
            }
        });
    };
    portalfn.prototype.accountHandle = function(obj, autoFlag){
        var self = this;
        $('.loading').show();
        accountAjax(obj, function(data){
            $('.loading').hide();
            if(autoFlag){
                $('#autoAccount').attr('disabled', false);
            }else{
                self.$login.text('登录').attr('disabled', false);
            }
            infoMsg("验证成功，可以连接网络!");
            if( self.$autoUser.length>0 && self.$autoUser.find('input[type=checkbox]').is(':checked') ){
                var name = self.$autoUser.data('name');
                localStorage[name]=self.opt.user;
            }
            if(data.pn=='321411'){
                window.location.href = '/user/'+self.opt.user+'?token='+data.Token+'&code='+data.Code+'&pn='+data.pn+'&ssid='+data.ssid+'&location='+data.location;
            }else{
                alert(self.urlChange(self.opt.firsturl, self.opt.urlparam));
                window.location.href = ( (!self.$login.data('url')) ? self.urlChange(self.opt.firsturl, self.opt.urlparam) : self.$login.data('url') );
            }
        }, function(error){
            $('.loading').hide();
            if(autoFlag){
                $('#autoAccount').attr('disabled', false);
            }else{
                self.$login.text('登录').attr('disabled', false);
            }
            try{
                var err = error.responseJSON;
                showMsg('验证失败：'+err.Msg);
            }catch(e) {
                showMsg('验证失败，请重新登录！');
            }
        });
    };
    portalfn.prototype.dmList = function(macs){
        for(var h='',i= 0,len=macs.split(',').length;i<len; i++){
            var $m = (len>1 ? macs.split(',')[i] : macs);
            h+='<label><input type="checkbox" checked /><span class="mac">'+$m+'</span></label>';
        }
        $('.ns_dmc .dmlist').html(h);
        $('.ns_dmc').fadeIn();
    };
    portalfn.prototype.downMacsHandle = function(){
        var self = this;
        $(document).on('click', '#dmQuit', function(){$('.ns_dmc').fadeOut()});
        $(document).on('click', '#dmSub', function(){
            var $mac=[];
            $('.dmlist label input').each(function(i, n){
                if($(n).is(':checked')){
                    $mac.push($(n).siblings('.mac').text());
                }
            });
            if($mac.length>0){
                var param={
                    user: self.opt.user,
                    macs: $mac.join(',')
                };
                accountDeleteAjax(param, function(data){
                    $('.ns_dmc').fadeOut('normal', function(){
                        showMsg("请在5秒后重新认证!");
                    });
                }, function(error){
                    showMsg("下线操作失败！");
                });
            }else{
                alert('请选择下线设备！');
            }
        });
    };
    portalfn.prototype.changePasswordHandle = function(){
        var self = this;
        var hidecgpwd = function(){
            $('.ns_cgpwd').fadeOut('normal', function(){
                $('.ns_cgpwd input').val('');
            });
        };
        $('#changepwd').on('click', function(e){
            e.stopPropagation();
            if(self.opt.user==''){
                showMsg('请输入账号！');return false;
            }
            $('.ns_cgpwd').fadeIn();
        });
        $(document).on('click', '#cgQuit', function(){hidecgpwd()});
        $(document).on('click', '#cgSub', function(){
            var $cgpwd = $('.ns_cgpwd .cgpwd');
            var $oldpwd = $cgpwd.find('input[name=oldpwd]'),
                $newpwd= $cgpwd.find('input[name=newpwd]'),
                $new2pwd= $cgpwd.find('input[name=new2pwd]');
            var oldpwd = $.trim($oldpwd.val()),
                newpwd = $.trim($newpwd.val()),
                new2pwd = $.trim($new2pwd.val());
            if(!oldpwd){$oldpwd.focus();return false;}
            if(!newpwd){$newpwd.focus();return false;}
            if(!new2pwd){$new2pwd.focus();return false;}
            if(newpwd==new2pwd){
                var param = {
                    newp: newpwd,
                    password: oldpwd
                };
                changePasswordAjax(self.opt.user, param, function(data){
                    alert("修改密码成功");
                    hidecgpwd();
                }, function(error){
                    try{
                        showMsg('修改密码失败：'+error.responseJSON.Msg);
                    }catch(e) {
                        showMsg('修改密码失败，请重新提交！');
                    }
                });
            }else{
                showMsg("两次新密码不一致!");
            }
        });
    };
    portalfn.prototype.MD5yzm = function(yzm){
        var m = hex_md5(yzm);
        var md1=m.substr(12, 4), md2=m.substr(-4);
        m = md1+md2;
        return m;
    };
    portalfn.prototype.urlChange = function(url, param){
        var reurl;
        var w=window.location.href;
        var d=w.indexOf('?');
        if(url==w.substr(0, d)){
            reurl = 'http://mbd.cniotroot.cn/';
        }else{
            reurl = (param=='' ? url : url+'?'+param);
        }
        return reurl;
    };

    $.fn.auPortal = function(options){
        var portal = new portalfn(this, options);
        return portal.init();
    };
})(jQuery);

// ajax
function getWifi(callback, errFunc){
    $.getScript('http://captive.apple.com/hotspot-detect.html&'+Math.random(), function(response, status){
        if(status=='success'){
            callback()
        }else{
            if(typeof(errFunc)=="function") errFunc();
        }
    });
}
function getYzmAjax(param, callback, errFunc){
    $.ajax({
        method: 'post',
        url: '/wnl/mobile',
        data: param,
        dataType: "json"
    }).done(function(data){
        callback(data);
    }).fail(function(error){
        if(typeof(errFunc)=="function") errFunc(error);
    });
}
function registerAjax(param, callback, errFunc){
    $.ajax({
        method: 'post',
        url: '/wnl/register',
        data: param,
        dataType: "json"
    }).done(function(data){
        callback(data);
    }).fail(function(error){
        if(typeof(errFunc)=="function") errFunc(error);
    });
}
function accountAjax(param, callback, errFunc){
    $.ajax({
        method: "POST",
        url: "/account",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(param),
        dataType: "json",
        timeout: 30000,
        success: function (data) {
            callback(data);
        },
        //complete: function(xmlhttp, status){
        //    completeFunc(xmlhttp, status);
        //},
        error: function (error) {
            if(typeof(errFunc)=="function") errFunc(error);
        }
    });
}
function accountDeleteAjax(param, callback, errFunc){
    $.ajax({
        method: 'delete',
        url: '/account',
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(param),
        dataType: "json"
    }).done(function(data){
        callback(data);
    }).fail(function(error){
        if(typeof(errFunc)=="function") errFunc(error);
    });
}
function changePasswordAjax(user, param, callback, errFunc){
    $.ajax({
        method: 'put',
        url: '/wnl/account/'+user,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(param),
        dataType: "json"
    }).done(function(data){
        callback(data);
    }).fail(function(error){
        if(typeof(errFunc)=="function") errFunc(error);
    });
}

// 监听
function AddEvent(obj, ev, fn){    //obj为要绑定事件的元素，ev为要绑定的事件，fn为绑定事件的函数
    if(obj.attachEvent) {
        obj.attachEvent("on"+ev, fn);
    } else {
        obj.addEventListener(ev, fn, false);
    }
}

var verify, canyzm = true;
function delayYZM(){
    var delay = $('#yzm span').text();
    var t = setTimeout('delayYZM()', 1000);
    if(delay>1){
        delay--;
        $('#yzm span').text(delay);
        canyzm = false;
    }else{
        clearTimeout(t);
        $('#yzm').html('获取验证码').attr('disabled', false);
        canyzm = true;
    }
}

var int;
function showMsg(msg, tos){
    clearTimeout(int);
    var msgbox = document.getElementById('msgBox');
    if(!!msgbox){
        msgbox.remove();
    }
    var msgdiv = document.createElement('div');
    msgdiv.id = 'msgBox';
    msgdiv.className = 'msgBox';
    msgdiv.innerText = msg;
    document.body.appendChild(msgdiv);
    if(!tos){tos = 4000;}
    int = setTimeout(function () {
        msgbox = document.getElementById('msgBox');
        msgbox.remove();
    }, tos);
}
function infoMsg(msg){
    var msgbox = document.getElementById('infoMsg');
    if(!!msgbox){
        msgbox.remove();
    }
    var msgdiv = document.createElement('div');
    msgdiv.id = 'infoMsg';
    msgdiv.className = 'infoMsg';
    msgdiv.innerText = msg;
    document.body.appendChild(msgdiv);
}

function getParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2].replace(/\+/g, "+"));return null;
}

;$(function(){
    //document.body.addEventListener('touchstart', function(){});
    AddEvent(document.body, 'touchstart', function(){});

    //响应输入框
    $('.inputWrapper').click(function(){$(this).find('input').focus()});
});