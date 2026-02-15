(function () {
    'use strict';

    /**
     * Reads, transforms and validates an attribute from an HTML element.
     */
    var readAttribute = (
        element,
        attributeName,
        {
            transform = (value) => value,
            validate = () => true,
            expectation = '(expectation not provided)',
        } = {},
    ) => {
        const value = element.getAttribute(attributeName);
        const transformedValue = transform(value);
        if (!validate(transformedValue)) {
            throw new Error(`Expected attribute ${attributeName} of element ${element.outerHTML} to be ${expectation}; got ${transformedValue} instead (${value} before the transform function was applied).`);
        }
        return transformedValue;
    };

    function t(){return t=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var r=arguments[e];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(t[n]=r[n]);}return t},t.apply(this,arguments)}var e="object"==typeof global&&global&&global.Object===Object&&global,r="object"==typeof self&&self&&self.Object===Object&&self,n=e||r||Function("return this")(),o=n.Symbol,i=Object.prototype,s=i.hasOwnProperty,a=i.toString,c=o?o.toStringTag:void 0,u=Object.prototype.toString,l="[object Null]",h="[object Undefined]",f=o?o.toStringTag:void 0;function d(t){return null==t?void 0===t?h:l:f&&f in Object(t)?function(t){var e=s.call(t,c),r=t[c];try{t[c]=void 0;var n=!0;}catch(t){}var o=a.call(t);return n&&(e?t[c]=r:delete t[c]),o}(t):function(t){return u.call(t)}(t)}function p(t){return null!=t&&"object"==typeof t}var g="[object Symbol]";function w(t){return "symbol"==typeof t||p(t)&&d(t)==g}function v(t,e){for(var r=-1,n=null==t?0:t.length,o=Array(n);++r<n;)o[r]=e(t[r],r,t);return o}var y=Array.isArray,_=1/0,b=o?o.prototype:void 0,m=b?b.toString:void 0;function j(t){if("string"==typeof t)return t;if(y(t))return v(t,j)+"";if(w(t))return m?m.call(t):"";var e=t+"";return "0"==e&&1/t==-_?"-0":e}function S(t){var e=typeof t;return null!=t&&("object"==e||"function"==e)}function O(t){return t}var x="[object AsyncFunction]",A="[object Function]",k="[object GeneratorFunction]",E="[object Proxy]";function z(t){if(!S(t))return !1;var e=d(t);return e==A||e==k||e==x||e==E}var F,P=n["__core-js_shared__"],T=(F=/[^.]+$/.exec(P&&P.keys&&P.keys.IE_PROTO||""))?"Symbol(src)_1."+F:"",N=Function.prototype.toString;function M(t){if(null!=t){try{return N.call(t)}catch(t){}try{return t+""}catch(t){}}return ""}var I=/^\[object .+?Constructor\]$/,$=RegExp("^"+Function.prototype.toString.call(Object.prototype.hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$");function D(t,e){var r=function(t,e){return null==t?void 0:t[e]}(t,e);return function(t){return !(!S(t)||(e=t,T&&T in e))&&(z(t)?$:I).test(M(t));var e;}(r)?r:void 0}var W,R,C,V=D(n,"WeakMap"),U=Object.create,q=function(){function t(){}return function(e){if(!S(e))return {};if(U)return U(e);t.prototype=e;var r=new t;return t.prototype=void 0,r}}(),B=Date.now,J=function(){try{var t=D(Object,"defineProperty");return t({},"",{}),t}catch(t){}}(),L=J,H=L?function(t,e){return L(t,"toString",{configurable:!0,enumerable:!1,value:(r=e,function(){return r}),writable:!0});var r;}:O,G=(W=H,R=0,C=0,function(){var t=B(),e=16-(t-C);if(C=t,e>0){if(++R>=800)return arguments[0]}else R=0;return W.apply(void 0,arguments)});function Z(t){return t!=t}function Y(t,e){return !(null==t||!t.length)&&function(t,e,r){return e==e?function(t,e,r){for(var n=-1,o=t.length;++n<o;)if(t[n]===e)return n;return -1}(t,e):function(t,e,r,n){for(var o=t.length,i=-1;++i<o;)if(e(t[i],i,t))return i;return -1}(t,Z)}(t,e)>-1}var K=9007199254740991,Q=/^(?:0|[1-9]\d*)$/;function X(t,e){var r=typeof t;return !!(e=null==e?K:e)&&("number"==r||"symbol"!=r&&Q.test(t))&&t>-1&&t%1==0&&t<e}function tt(t,e,r){"__proto__"==e&&L?L(t,e,{configurable:!0,enumerable:!0,value:r,writable:!0}):t[e]=r;}function et(t,e){return t===e||t!=t&&e!=e}var rt=Object.prototype.hasOwnProperty;function nt(t,e,r){var n=t[e];rt.call(t,e)&&et(n,r)&&(void 0!==r||e in t)||tt(t,e,r);}function ot(t,e,r,n){var o=!r;r||(r={});for(var i=-1,s=e.length;++i<s;){var a=e[i],c=void 0;void 0===c&&(c=t[a]),o?tt(r,a,c):nt(r,a,c);}return r}var it=Math.max,st=9007199254740991;function at(t){return "number"==typeof t&&t>-1&&t%1==0&&t<=st}function ct(t){return null!=t&&at(t.length)&&!z(t)}var ut=Object.prototype;function lt(t){var e=t&&t.constructor;return t===("function"==typeof e&&e.prototype||ut)}function ht(t){return p(t)&&"[object Arguments]"==d(t)}var ft=Object.prototype,dt=ft.hasOwnProperty,pt=ft.propertyIsEnumerable,gt=ht(function(){return arguments}())?ht:function(t){return p(t)&&dt.call(t,"callee")&&!pt.call(t,"callee")},wt="object"==typeof exports&&exports&&!exports.nodeType&&exports,vt=wt&&"object"==typeof module&&module&&!module.nodeType&&module,yt=vt&&vt.exports===wt?n.Buffer:void 0,_t=(yt?yt.isBuffer:void 0)||function(){return !1},bt={};function mt(t){return function(e){return t(e)}}bt["[object Float32Array]"]=bt["[object Float64Array]"]=bt["[object Int8Array]"]=bt["[object Int16Array]"]=bt["[object Int32Array]"]=bt["[object Uint8Array]"]=bt["[object Uint8ClampedArray]"]=bt["[object Uint16Array]"]=bt["[object Uint32Array]"]=!0,bt["[object Arguments]"]=bt["[object Array]"]=bt["[object ArrayBuffer]"]=bt["[object Boolean]"]=bt["[object DataView]"]=bt["[object Date]"]=bt["[object Error]"]=bt["[object Function]"]=bt["[object Map]"]=bt["[object Number]"]=bt["[object Object]"]=bt["[object RegExp]"]=bt["[object Set]"]=bt["[object String]"]=bt["[object WeakMap]"]=!1;var jt="object"==typeof exports&&exports&&!exports.nodeType&&exports,St=jt&&"object"==typeof module&&module&&!module.nodeType&&module,Ot=St&&St.exports===jt&&e.process,xt=function(){try{return St&&St.require&&St.require("util").types||Ot&&Ot.binding&&Ot.binding("util")}catch(t){}}(),At=xt&&xt.isTypedArray,kt=At?mt(At):function(t){return p(t)&&at(t.length)&&!!bt[d(t)]},Et=Object.prototype.hasOwnProperty;function zt(t,e){var r=y(t),n=!r&&gt(t),o=!r&&!n&&_t(t),i=!r&&!n&&!o&&kt(t),s=r||n||o||i,a=s?function(t,e){for(var r=-1,n=Array(t);++r<t;)n[r]=e(r);return n}(t.length,String):[],c=a.length;for(var u in t)!Et.call(t,u)||s&&("length"==u||o&&("offset"==u||"parent"==u)||i&&("buffer"==u||"byteLength"==u||"byteOffset"==u)||X(u,c))||a.push(u);return a}function Ft(t,e){return function(r){return t(e(r))}}var Pt=Ft(Object.keys,Object),Tt=Object.prototype.hasOwnProperty;function Nt(t){return ct(t)?zt(t):function(t){if(!lt(t))return Pt(t);var e=[];for(var r in Object(t))Tt.call(t,r)&&"constructor"!=r&&e.push(r);return e}(t)}var $t=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,Dt=/^\w*$/;function Wt(t,e){if(y(t))return !1;var r=typeof t;return !("number"!=r&&"symbol"!=r&&"boolean"!=r&&null!=t&&!w(t))||Dt.test(t)||!$t.test(t)||null!=e&&t in Object(e)}var Rt=D(Object,"create"),Ct=Object.prototype.hasOwnProperty,Vt=Object.prototype.hasOwnProperty;function Ut(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1]);}}function qt(t,e){for(var r=t.length;r--;)if(et(t[r][0],e))return r;return -1}Ut.prototype.clear=function(){this.__data__=Rt?Rt(null):{},this.size=0;},Ut.prototype.delete=function(t){var e=this.has(t)&&delete this.__data__[t];return this.size-=e?1:0,e},Ut.prototype.get=function(t){var e=this.__data__;if(Rt){var r=e[t];return "__lodash_hash_undefined__"===r?void 0:r}return Ct.call(e,t)?e[t]:void 0},Ut.prototype.has=function(t){var e=this.__data__;return Rt?void 0!==e[t]:Vt.call(e,t)},Ut.prototype.set=function(t,e){var r=this.__data__;return this.size+=this.has(t)?0:1,r[t]=Rt&&void 0===e?"__lodash_hash_undefined__":e,this};var Bt=Array.prototype.splice;function Jt(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1]);}}Jt.prototype.clear=function(){this.__data__=[],this.size=0;},Jt.prototype.delete=function(t){var e=this.__data__,r=qt(e,t);return !(r<0||(r==e.length-1?e.pop():Bt.call(e,r,1),--this.size,0))},Jt.prototype.get=function(t){var e=this.__data__,r=qt(e,t);return r<0?void 0:e[r][1]},Jt.prototype.has=function(t){return qt(this.__data__,t)>-1},Jt.prototype.set=function(t,e){var r=this.__data__,n=qt(r,t);return n<0?(++this.size,r.push([t,e])):r[n][1]=e,this};var Lt=D(n,"Map");function Ht(t,e){var r,n,o=t.__data__;return ("string"==(n=typeof(r=e))||"number"==n||"symbol"==n||"boolean"==n?"__proto__"!==r:null===r)?o["string"==typeof e?"string":"hash"]:o.map}function Gt(t){var e=-1,r=null==t?0:t.length;for(this.clear();++e<r;){var n=t[e];this.set(n[0],n[1]);}}function Zt(t,e){if("function"!=typeof t||null!=e&&"function"!=typeof e)throw new TypeError("Expected a function");var r=function(){var n=arguments,o=e?e.apply(this,n):n[0],i=r.cache;if(i.has(o))return i.get(o);var s=t.apply(this,n);return r.cache=i.set(o,s)||i,s};return r.cache=new(Zt.Cache||Gt),r}Gt.prototype.clear=function(){this.size=0,this.__data__={hash:new Ut,map:new(Lt||Jt),string:new Ut};},Gt.prototype.delete=function(t){var e=Ht(this,t).delete(t);return this.size-=e?1:0,e},Gt.prototype.get=function(t){return Ht(this,t).get(t)},Gt.prototype.has=function(t){return Ht(this,t).has(t)},Gt.prototype.set=function(t,e){var r=Ht(this,t),n=r.size;return r.set(t,e),this.size+=r.size==n?0:1,this},Zt.Cache=Gt;var Yt,Kt,Qt=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,Xt=/\\(\\)?/g,te=(Yt=Zt(function(t){var e=[];return 46===t.charCodeAt(0)&&e.push(""),t.replace(Qt,function(t,r,n,o){e.push(n?o.replace(Xt,"$1"):r||t);}),e},function(t){return 500===Kt.size&&Kt.clear(),t}),Kt=Yt.cache,Yt);function ee(t,e){return y(t)?t:Wt(t,e)?[t]:te(function(t){return null==t?"":j(t)}(t))}var re=1/0;function ne(t){if("string"==typeof t||w(t))return t;var e=t+"";return "0"==e&&1/t==-re?"-0":e}function oe(t,e){for(var r=0,n=(e=ee(e,t)).length;null!=t&&r<n;)t=t[ne(e[r++])];return r&&r==n?t:void 0}function ie(t,e){for(var r=-1,n=e.length,o=t.length;++r<n;)t[o+r]=e[r];return t}var se=Ft(Object.getPrototypeOf,Object);function ae(t){var e=this.__data__=new Jt(t);this.size=e.size;}ae.prototype.clear=function(){this.__data__=new Jt,this.size=0;},ae.prototype.delete=function(t){var e=this.__data__,r=e.delete(t);return this.size=e.size,r},ae.prototype.get=function(t){return this.__data__.get(t)},ae.prototype.has=function(t){return this.__data__.has(t)},ae.prototype.set=function(t,e){var r=this.__data__;if(r instanceof Jt){var n=r.__data__;if(!Lt||n.length<199)return n.push([t,e]),this.size=++r.size,this;r=this.__data__=new Gt(n);}return r.set(t,e),this.size=r.size,this};var ce="object"==typeof exports&&exports&&!exports.nodeType&&exports,ue=ce&&"object"==typeof module&&module&&!module.nodeType&&module,le=ue&&ue.exports===ce?n.Buffer:void 0,he=le?le.allocUnsafe:void 0;function fe(){return []}var de=Object.prototype.propertyIsEnumerable,pe=Object.getOwnPropertySymbols,ge=pe?function(t){return null==t?[]:(t=Object(t),function(e,r){for(var n=-1,o=null==e?0:e.length,i=0,s=[];++n<o;){var a=e[n];de.call(t,a)&&(s[i++]=a);}return s}(pe(t)))}:fe,we=ge;function ye(t,e,r){var n=e(t);return y(t)?n:ie(n,r(t))}function _e(t){return ye(t,Nt,we)}var me=D(n,"DataView"),je=D(n,"Promise"),Se=D(n,"Set"),Oe="[object Map]",xe="[object Promise]",Ae="[object Set]",ke="[object WeakMap]",Ee="[object DataView]",ze=M(me),Fe=M(Lt),Pe=M(je),Te=M(Se),Ne=M(V),Me=d;(me&&Me(new me(new ArrayBuffer(1)))!=Ee||Lt&&Me(new Lt)!=Oe||je&&Me(je.resolve())!=xe||Se&&Me(new Se)!=Ae||V&&Me(new V)!=ke)&&(Me=function(t){var e=d(t),r="[object Object]"==e?t.constructor:void 0,n=r?M(r):"";if(n)switch(n){case ze:return Ee;case Fe:return Oe;case Pe:return xe;case Te:return Ae;case Ne:return ke}return e});var Ie=Me,$e=Object.prototype.hasOwnProperty,De=n.Uint8Array;function We(t){var e=new t.constructor(t.byteLength);return new De(e).set(new De(t)),e}var Re=/\w*$/,Ce=o?o.prototype:void 0,Ve=Ce?Ce.valueOf:void 0,Ue="[object Boolean]",qe="[object Date]",Be="[object Map]",Je="[object Number]",Le="[object RegExp]",He="[object Set]",Ge="[object String]",Ze="[object Symbol]",Ye="[object ArrayBuffer]",Ke="[object DataView]",Qe="[object Float32Array]",Xe="[object Float64Array]",tr="[object Int8Array]",er="[object Int16Array]",rr="[object Int32Array]",nr="[object Uint8Array]",or="[object Uint8ClampedArray]",ir="[object Uint16Array]",sr="[object Uint32Array]",ar=xt&&xt.isMap,cr=ar?mt(ar):function(t){return p(t)&&"[object Map]"==Ie(t)},ur=xt&&xt.isSet,lr=ur?mt(ur):function(t){return p(t)&&"[object Set]"==Ie(t)},hr=1,pr="[object Arguments]",gr="[object Function]",wr="[object GeneratorFunction]",vr="[object Object]",yr={};function _r(t,e,r,n,o,i){var s,a=e&hr;if(void 0!==s)return s;if(!S(t))return t;var l=y(t);if(l){if(s=function(t){var e=t.length,r=new t.constructor(e);return e&&"string"==typeof t[0]&&$e.call(t,"index")&&(r.index=t.index,r.input=t.input),r}(t),!a)return function(t,e){var r=-1,n=t.length;for(e||(e=Array(n));++r<n;)e[r]=t[r];return e}(t,s)}else {var h=Ie(t),f=h==gr||h==wr;if(_t(t))return function(t,e){var r=t.length,n=he?he(r):new t.constructor(r);return t.copy(n),n}(t);if(h==vr||h==pr||f&&!o){if(s=f?{}:function(t){return "function"!=typeof t.constructor||lt(t)?{}:q(se(t))}(t),!a)return function(t,e){return ot(t,we(t),e)}(t,function(t,e){return t&&ot(e,Nt(e),t)}(s,t))}else {if(!yr[h])return o?t:{};s=function(t,e,r){var n,o,i=t.constructor;switch(e){case Ye:return We(t);case Ue:case qe:return new i(+t);case Ke:return function(t,e){var r=t.buffer;return new t.constructor(r,t.byteOffset,t.byteLength)}(t);case Qe:case Xe:case tr:case er:case rr:case nr:case or:case ir:case sr:return function(t,e){var r=t.buffer;return new t.constructor(r,t.byteOffset,t.length)}(t);case Be:return new i;case Je:case Ge:return new i(t);case Le:return (o=new(n=t).constructor(n.source,Re.exec(n))).lastIndex=n.lastIndex,o;case He:return new i;case Ze:return Ve?Object(Ve.call(t)):{}}}(t,h);}}i||(i=new ae);var d=i.get(t);if(d)return d;i.set(t,s),lr(t)?t.forEach(function(n){s.add(_r(n,e,r,n,t,i));}):cr(t)&&t.forEach(function(n,o){s.set(o,_r(n,e,r,o,t,i));});var p=l?void 0:(_e)(t);return function(t,e){for(var r=-1,n=null==t?0:t.length;++r<n&&!1!==e(t[r],r););}(p||t,function(n,o){p&&(n=t[o=n]),nt(s,o,_r(n,e,r,o,t,i));}),s}function br(t){return _r(t,4)}function mr(t){var e=-1,r=null==t?0:t.length;for(this.__data__=new Gt;++e<r;)this.add(t[e]);}function jr(t,e){for(var r=-1,n=null==t?0:t.length;++r<n;)if(e(t[r],r,t))return !0;return !1}function Sr(t,e){return t.has(e)}yr[pr]=yr["[object Array]"]=yr["[object ArrayBuffer]"]=yr["[object DataView]"]=yr["[object Boolean]"]=yr["[object Date]"]=yr["[object Float32Array]"]=yr["[object Float64Array]"]=yr["[object Int8Array]"]=yr["[object Int16Array]"]=yr["[object Int32Array]"]=yr["[object Map]"]=yr["[object Number]"]=yr[vr]=yr["[object RegExp]"]=yr["[object Set]"]=yr["[object String]"]=yr["[object Symbol]"]=yr["[object Uint8Array]"]=yr["[object Uint8ClampedArray]"]=yr["[object Uint16Array]"]=yr["[object Uint32Array]"]=!0,yr["[object Error]"]=yr[gr]=yr["[object WeakMap]"]=!1,mr.prototype.add=mr.prototype.push=function(t){return this.__data__.set(t,"__lodash_hash_undefined__"),this},mr.prototype.has=function(t){return this.__data__.has(t)};var Or=1,xr=2;function Ar(t,e,r,n,o,i){var s=r&Or,a=t.length,c=e.length;if(a!=c&&!(s&&c>a))return !1;var u=i.get(t),l=i.get(e);if(u&&l)return u==e&&l==t;var h=-1,f=!0,d=r&xr?new mr:void 0;for(i.set(t,e),i.set(e,t);++h<a;){var p=t[h],g=e[h];if(n)var w=s?n(g,p,h,e,t,i):n(p,g,h,t,e,i);if(void 0!==w){if(w)continue;f=!1;break}if(d){if(!jr(e,function(t,e){if(!Sr(d,e)&&(p===t||o(p,t,r,n,i)))return d.push(e)})){f=!1;break}}else if(p!==g&&!o(p,g,r,n,i)){f=!1;break}}return i.delete(t),i.delete(e),f}function kr(t){var e=-1,r=Array(t.size);return t.forEach(function(t,n){r[++e]=[n,t];}),r}function Er(t){var e=-1,r=Array(t.size);return t.forEach(function(t){r[++e]=t;}),r}var zr=1,Fr=2,Pr="[object Boolean]",Tr="[object Date]",Nr="[object Error]",Mr="[object Map]",Ir="[object Number]",$r="[object RegExp]",Dr="[object Set]",Wr="[object String]",Rr="[object Symbol]",Cr="[object ArrayBuffer]",Vr="[object DataView]",Ur=o?o.prototype:void 0,qr=Ur?Ur.valueOf:void 0,Br=1,Jr=Object.prototype.hasOwnProperty,Lr=1,Hr="[object Arguments]",Gr="[object Array]",Zr="[object Object]",Yr=Object.prototype.hasOwnProperty;function Kr(t,e,r,n,o){return t===e||(null==t||null==e||!p(t)&&!p(e)?t!=t&&e!=e:function(t,e,r,n,o,i){var s=y(t),a=y(e),c=s?Gr:Ie(t),u=a?Gr:Ie(e),l=(c=c==Hr?Zr:c)==Zr,h=(u=u==Hr?Zr:u)==Zr,f=c==u;if(f&&_t(t)){if(!_t(e))return !1;s=!0,l=!1;}if(f&&!l)return i||(i=new ae),s||kt(t)?Ar(t,e,r,n,o,i):function(t,e,r,n,o,i,s){switch(r){case Vr:if(t.byteLength!=e.byteLength||t.byteOffset!=e.byteOffset)return !1;t=t.buffer,e=e.buffer;case Cr:return !(t.byteLength!=e.byteLength||!i(new De(t),new De(e)));case Pr:case Tr:case Ir:return et(+t,+e);case Nr:return t.name==e.name&&t.message==e.message;case $r:case Wr:return t==e+"";case Mr:var a=kr;case Dr:if(a||(a=Er),t.size!=e.size&&!(n&zr))return !1;var c=s.get(t);if(c)return c==e;n|=Fr,s.set(t,e);var u=Ar(a(t),a(e),n,o,i,s);return s.delete(t),u;case Rr:if(qr)return qr.call(t)==qr.call(e)}return !1}(t,e,c,r,n,o,i);if(!(r&Lr)){var d=l&&Yr.call(t,"__wrapped__"),p=h&&Yr.call(e,"__wrapped__");if(d||p){var g=d?t.value():t,w=p?e.value():e;return i||(i=new ae),o(g,w,r,n,i)}}return !!f&&(i||(i=new ae),function(t,e,r,n,o,i){var s=r&Br,a=_e(t),c=a.length;if(c!=_e(e).length&&!s)return !1;for(var u=c;u--;){var l=a[u];if(!(s?l in e:Jr.call(e,l)))return !1}var h=i.get(t),f=i.get(e);if(h&&f)return h==e&&f==t;var d=!0;i.set(t,e),i.set(e,t);for(var p=s;++u<c;){var g=t[l=a[u]],w=e[l];if(n)var v=s?n(w,g,l,e,t,i):n(g,w,l,t,e,i);if(!(void 0===v?g===w||o(g,w,r,n,i):v)){d=!1;break}p||(p="constructor"==l);}if(d&&!p){var y=t.constructor,_=e.constructor;y==_||!("constructor"in t)||!("constructor"in e)||"function"==typeof y&&y instanceof y&&"function"==typeof _&&_ instanceof _||(d=!1);}return i.delete(t),i.delete(e),d}(t,e,r,n,o,i))}(t,e,r,n,Kr,o))}var Qr=1,Xr=2;function tn(t){return t==t&&!S(t)}function en(t,e){return function(r){return null!=r&&r[t]===e&&(void 0!==e||t in Object(r))}}function rn(t,e){return null!=t&&e in Object(t)}var nn=1,on=2;function sn(t){return "function"==typeof t?t:null==t?O:"object"==typeof t?y(t)?function(t,e){return Wt(t)&&tn(e)?en(ne(t),e):function(r){var n=function(t,e,r){var n=null==t?void 0:oe(t,e);return void 0===n?void 0:n}(r,t);return void 0===n&&n===e?function(t,e){return null!=t&&function(t,e,r){for(var n=-1,o=(e=ee(e,t)).length,i=!1;++n<o;){var s=ne(e[n]);if(!(i=null!=t&&r(t,s)))break;t=t[s];}return i||++n!=o?i:!!(o=null==t?0:t.length)&&at(o)&&X(s,o)&&(y(t)||gt(t))}(t,e,rn)}(r,t):Kr(e,n,nn|on)}}(t[0],t[1]):(o=function(t){for(var e=Nt(t),r=e.length;r--;){var n=e[r],o=t[n];e[r]=[n,o,tn(o)];}return e}(n=t),1==o.length&&o[0][2]?en(o[0][0],o[0][1]):function(t){return t===n||function(t,e,r,n){var o=r.length,i=o;if(null==t)return !i;for(t=Object(t);o--;){var s=r[o];if(s[2]?s[1]!==t[s[0]]:!(s[0]in t))return !1}for(;++o<i;){var a=(s=r[o])[0],c=t[a],u=s[1];if(s[2]){if(void 0===c&&!(a in t))return !1}else {var l=new ae;if(!Kr(u,c,Qr|Xr,void 0,l))return !1}}return !0}(t,0,o)}):Wt(e=t)?(r=ne(e),function(t){return null==t?void 0:t[r]}):function(t){return function(e){return oe(e,t)}}(e);var e,r,n,o;}function an(t,e){return t&&function(t,e,r){for(var n=-1,o=Object(t),i=r(t),s=i.length;s--;){var a=i[++n];if(!1===e(o[a],a,o))break}return t}(t,e,Nt)}var cn,un=(cn=an,function(t,e){if(null==t)return t;if(!ct(t))return cn(t,e);for(var r=t.length,n=-1,o=Object(t);++n<r&&!1!==e(o[n],n,o););return t});function ln(t,e){var r=-1,n=ct(t)?Array(t.length):[];return un(t,function(t,o,i){n[++r]=e(t,o,i);}),n}function hn(t,e){return t>e}var fn=Math.min;function dn(t){return function(t){return p(t)&&ct(t)}(t)?t:[]}var pn=function(t,e){return G(function(t,e,r){return e=it(void 0===e?t.length-1:e,0),function(){for(var n=arguments,o=-1,i=it(n.length-e,0),s=Array(i);++o<i;)s[o]=n[e+o];o=-1;for(var a=Array(e+1);++o<e;)a[o]=n[o];return a[e]=r(s),function(t,e,r){switch(r.length){case 0:return t.call(e);case 1:return t.call(e,r[0]);case 2:return t.call(e,r[0],r[1]);case 3:return t.call(e,r[0],r[1],r[2])}return t.apply(e,r)}(t,this,a)}}(t,void 0,O),t+"")}(function(t){var e=v(t,dn);return e.length&&e[0]===t[0]?function(t,e,r){for(var n=Y,o=t[0].length,i=t.length,s=i,a=Array(i),c=Infinity,u=[];s--;){var l=t[s];c=fn(l.length,c),a[s]=o>=120&&l.length>=120?new mr(s&&l):void 0;}l=t[0];var h=-1,f=a[0];t:for(;++h<o&&u.length<c;){var d=l[h],p=d;if(d=0!==d?d:0,!(f?Sr(f,p):n(u,p,r))){for(s=i;--s;){var g=a[s];if(!(g?Sr(g,p):n(t[s],p,r)))continue t}f&&f.push(p),u.push(d);}}return u}(e):[]}),gn=pn;function wn(t,e){return t<e}function vn(t,e,r){for(var n=-1,o=t.length;++n<o;){var i=t[n],s=e(i);if(null!=s&&(void 0===a?s==s&&!w(s):r(s,a)))var a=s,c=i;}return c}function yn(t,e){return t&&t.length?vn(t,sn(e),hn):void 0}function _n(t,e){for(var r,n=-1,o=t.length;++n<o;){var i=e(t[n]);void 0!==i&&(r=void 0===r?i:r+i);}return r}function bn(t,e){return function(t,e){var r=null==t?0:t.length;return r?_n(t,e)/r:NaN}(t,sn(e))}function mn(t,e){if(t!==e){var r=void 0!==t,n=null===t,o=t==t,i=w(t),s=void 0!==e,a=null===e,c=e==e,u=w(e);if(!a&&!u&&!i&&t>e||i&&s&&c&&!a&&!u||n&&s&&c||!r&&c||!o)return 1;if(!n&&!i&&!u&&t<e||u&&r&&o&&!n&&!i||a&&r&&o||!s&&o||!c)return -1}return 0}function jn(t,e,r,n){return null==t?[]:(y(e)||(e=null==e?[]:[e]),y(r=r)||(r=null==r?[]:[r]),function(t,e,r){e=e.length?v(e,function(t){return y(t)?function(e){return oe(e,1===t.length?t[0]:t)}:t}):[O];var n=-1;return e=v(e,mt(sn)),function(t,e){var n=t.length;for(t.sort(function(t,e){return function(t,e,r){for(var n=-1,o=t.criteria,i=e.criteria,s=o.length,a=r.length;++n<s;){var c=mn(o[n],i[n]);if(c)return n>=a?c:c*("desc"==r[n]?-1:1)}return t.index-e.index}(t,e,r)});n--;)t[n]=t[n].value;return t}(ln(t,function(t,r,o){return {criteria:v(e,function(e){return e(t)}),index:++n,value:t}}))}(t,e,r))}function Sn(t,e){return t&&t.length?_n(t,sn(e)):0}function On(t){if(this.words=[],t)if(Symbol&&Symbol.iterator&&void 0!==t[Symbol.iterator]){const e=t[Symbol.iterator]();let r=e.next();for(;!r.done;)this.add(r.value),r=e.next();}else for(let e=0;e<t.length;e++)this.add(t[e]);}On.fromWords=function(t){const e=Object.create(On.prototype);return e.words=t,e},On.prototype.add=function(t){this.resize(t),this.words[t>>>5]|=1<<t;},On.prototype.flip=function(t){this.resize(t),this.words[t>>>5]^=1<<t;},On.prototype.clear=function(){this.words.length=0;},On.prototype.remove=function(t){this.resize(t),this.words[t>>>5]&=~(1<<t);},On.prototype.isEmpty=function(t){const e=this.words.length;for(let t=0;t<e;t++)if(0!==this.words[t])return !1;return !0},On.prototype.has=function(t){return 0!=(this.words[t>>>5]&1<<t)},On.prototype.checkedAdd=function(t){this.resize(t);const e=this.words[t>>>5],r=e|1<<t;return this.words[t>>>5]=r,(r^e)>>>t},On.prototype.trim=function(t){let e=this.words.length;for(;e>0&&0===this.words[e-1];)e--;this.words.length=e;},On.prototype.resize=function(t){const e=t+32>>>5;for(let t=this.words.length;t<e;t++)this.words[t]=0;},On.prototype.hammingWeight=function(t){return 16843009*((t=(858993459&(t-=t>>>1&1431655765))+(t>>>2&858993459))+(t>>>4)&252645135)>>>24},On.prototype.hammingWeight4=function(t,e,r,n){return 16843009*((t=(t=(858993459&(t-=t>>>1&1431655765))+(t>>>2&858993459))+(t>>>4)&252645135)+(e=(e=(858993459&(e-=e>>>1&1431655765))+(e>>>2&858993459))+(e>>>4)&252645135)+(r=(r=(858993459&(r-=r>>>1&1431655765))+(r>>>2&858993459))+(r>>>4)&252645135)+(n=(n=(858993459&(n-=n>>>1&1431655765))+(n>>>2&858993459))+(n>>>4)&252645135))>>>24},On.prototype.size=function(){let t=0;const e=this.words.length,r=this.words;for(let n=0;n<e;n++)t+=this.hammingWeight(r[n]);return t},On.prototype.array=function(){const t=new Array(this.size());let e=0;const r=this.words.length;for(let n=0;n<r;++n){let r=this.words[n];for(;0!=r;){const o=r&-r;t[e++]=(n<<5)+this.hammingWeight(o-1|0),r^=o;}}return t},On.prototype.forEach=function(t){const e=this.words.length;for(let r=0;r<e;++r){let e=this.words[r];for(;0!=e;){const n=e&-e;t((r<<5)+this.hammingWeight(n-1|0)),e^=n;}}},On.prototype[Symbol.iterator]=function(){const t=this.words.length;let e=0,r=this.words[e],n=this.hammingWeight,o=this.words;return {[Symbol.iterator](){return this},next(){for(;e<t;){if(0!==r){const t=r&-r,o=(e<<5)+n(t-1|0);return r^=t,{done:!1,value:o}}e++,e<t&&(r=o[e]);}return {done:!0,value:void 0}}}},On.prototype.clone=function(){const t=Object.create(On.prototype);return t.words=this.words.slice(),t},On.prototype.intersects=function(t){const e=Math.min(this.words.length,t.words.length);for(let r=0;r<e;++r)if(0!=(this.words[r]&t.words[r]))return !0;return !1},On.prototype.intersection=function(t){const e=Math.min(this.words.length,t.words.length);let r=0;for(;r+7<e;r+=8)this.words[r]&=t.words[r],this.words[r+1]&=t.words[r+1],this.words[r+2]&=t.words[r+2],this.words[r+3]&=t.words[r+3],this.words[r+4]&=t.words[r+4],this.words[r+5]&=t.words[r+5],this.words[r+6]&=t.words[r+6],this.words[r+7]&=t.words[r+7];for(;r<e;++r)this.words[r]&=t.words[r];const n=this.words.length;for(r=e;r<n;++r)this.words[r]=0;return this},On.prototype.intersection_size=function(t){const e=Math.min(this.words.length,t.words.length);let r=0;for(let n=0;n<e;++n)r+=this.hammingWeight(this.words[n]&t.words[n]);return r},On.prototype.new_intersection=function(t){const e=Object.create(On.prototype),r=Math.min(this.words.length,t.words.length);e.words=new Array(r);let n=0;for(;n+7<r;n+=8)e.words[n]=this.words[n]&t.words[n],e.words[n+1]=this.words[n+1]&t.words[n+1],e.words[n+2]=this.words[n+2]&t.words[n+2],e.words[n+3]=this.words[n+3]&t.words[n+3],e.words[n+4]=this.words[n+4]&t.words[n+4],e.words[n+5]=this.words[n+5]&t.words[n+5],e.words[n+6]=this.words[n+6]&t.words[n+6],e.words[n+7]=this.words[n+7]&t.words[n+7];for(;n<r;++n)e.words[n]=this.words[n]&t.words[n];return e},On.prototype.equals=function(t){const e=Math.min(this.words.length,t.words.length);for(let r=0;r<e;++r)if(this.words[r]!=t.words[r])return !1;if(this.words.length<t.words.length){const e=t.words.length;for(let r=this.words.length;r<e;++r)if(0!=t.words[r])return !1}else if(t.words.length<this.words.length){const e=this.words.length;for(let r=t.words.length;r<e;++r)if(0!=this.words[r])return !1}return !0},On.prototype.difference=function(t){const e=Math.min(this.words.length,t.words.length);let r=0;for(;r+7<e;r+=8)this.words[r]&=~t.words[r],this.words[r+1]&=~t.words[r+1],this.words[r+2]&=~t.words[r+2],this.words[r+3]&=~t.words[r+3],this.words[r+4]&=~t.words[r+4],this.words[r+5]&=~t.words[r+5],this.words[r+6]&=~t.words[r+6],this.words[r+7]&=~t.words[r+7];for(;r<e;++r)this.words[r]&=~t.words[r];return this},On.prototype.new_difference=function(t){return this.clone().difference(t)},On.prototype.difference2=function(t){const e=Math.min(this.words.length,t.words.length);let r=0;for(;r+7<e;r+=8)t.words[r]=this.words[r]&~t.words[r],t.words[r+1]=this.words[r+1]&~t.words[r+1],t.words[r+2]=this.words[r+2]&~t.words[r+2],t.words[r+3]=this.words[r+3]&~t.words[r+3],t.words[r+4]=this.words[r+4]&~t.words[r+4],t.words[r+5]=this.words[r+5]&~t.words[r+5],t.words[r+6]=this.words[r+6]&~t.words[r+6],t.words[r+7]=this.words[r+7]&~t.words[r+7];for(;r<e;++r)t.words[r]=this.words[r]&~t.words[r];for(r=this.words.length-1;r>=e;--r)t.words[r]=this.words[r];return t.words.length=this.words.length,t},On.prototype.difference_size=function(t){const e=Math.min(this.words.length,t.words.length);let r=0,n=0;for(;n<e;++n)r+=this.hammingWeight(this.words[n]&~t.words[n]);const o=this.words.length;for(;n<o;++n)r+=this.hammingWeight(this.words[n]);return r},On.prototype.change=function(t){const e=Math.min(this.words.length,t.words.length);let r=0;for(;r+7<e;r+=8)this.words[r]^=t.words[r],this.words[r+1]^=t.words[r+1],this.words[r+2]^=t.words[r+2],this.words[r+3]^=t.words[r+3],this.words[r+4]^=t.words[r+4],this.words[r+5]^=t.words[r+5],this.words[r+6]^=t.words[r+6],this.words[r+7]^=t.words[r+7];for(;r<e;++r)this.words[r]^=t.words[r];for(r=t.words.length-1;r>=e;--r)this.words[r]=t.words[r];return this},On.prototype.new_change=function(t){const e=Object.create(On.prototype),r=Math.max(this.words.length,t.words.length);e.words=new Array(r);const n=Math.min(this.words.length,t.words.length);let o=0;for(;o+7<n;o+=8)e.words[o]=this.words[o]^t.words[o],e.words[o+1]=this.words[o+1]^t.words[o+1],e.words[o+2]=this.words[o+2]^t.words[o+2],e.words[o+3]=this.words[o+3]^t.words[o+3],e.words[o+4]=this.words[o+4]^t.words[o+4],e.words[o+5]=this.words[o+5]^t.words[o+5],e.words[o+6]=this.words[o+6]^t.words[o+6],e.words[o+7]=this.words[o+7]^t.words[o+7];for(;o<n;++o)e.words[o]=this.words[o]^t.words[o];const i=this.words.length;for(o=n;o<i;++o)e.words[o]=this.words[o];const s=t.words.length;for(o=n;o<s;++o)e.words[o]=t.words[o];return e},On.prototype.change_size=function(t){const e=Math.min(this.words.length,t.words.length);let r=0,n=0;for(;n<e;++n)r+=this.hammingWeight(this.words[n]^t.words[n]);const o=this.words.length>t.words.length?this:t,i=o.words.length;for(;n<i;++n)r+=this.hammingWeight(o.words[n]);return r},On.prototype.toString=function(){return "{"+this.array().join(",")+"}"},On.prototype.union=function(t){const e=Math.min(this.words.length,t.words.length);let r=0;for(;r+7<e;r+=8)this.words[r]|=t.words[r],this.words[r+1]|=t.words[r+1],this.words[r+2]|=t.words[r+2],this.words[r+3]|=t.words[r+3],this.words[r+4]|=t.words[r+4],this.words[r+5]|=t.words[r+5],this.words[r+6]|=t.words[r+6],this.words[r+7]|=t.words[r+7];for(;r<e;++r)this.words[r]|=t.words[r];if(this.words.length<t.words.length){this.resize((t.words.length<<5)-1);const r=t.words.length;for(let n=e;n<r;++n)this.words[n]=t.words[n];}return this},On.prototype.new_union=function(t){const e=Object.create(On.prototype),r=Math.max(this.words.length,t.words.length);e.words=new Array(r);const n=Math.min(this.words.length,t.words.length);let o=0;for(;o+7<n;o+=8)e.words[o]=this.words[o]|t.words[o],e.words[o+1]=this.words[o+1]|t.words[o+1],e.words[o+2]=this.words[o+2]|t.words[o+2],e.words[o+3]=this.words[o+3]|t.words[o+3],e.words[o+4]=this.words[o+4]|t.words[o+4],e.words[o+5]=this.words[o+5]|t.words[o+5],e.words[o+6]=this.words[o+6]|t.words[o+6],e.words[o+7]=this.words[o+7]|t.words[o+7];for(;o<n;++o)e.words[o]=this.words[o]|t.words[o];const i=this.words.length;for(o=n;o<i;++o)e.words[o]=this.words[o];const s=t.words.length;for(o=n;o<s;++o)e.words[o]=t.words[o];return e},On.prototype.union_size=function(t){const e=Math.min(this.words.length,t.words.length);let r=0;for(let n=0;n<e;++n)r+=this.hammingWeight(this.words[n]|t.words[n]);if(this.words.length<t.words.length){const e=t.words.length;for(let n=this.words.length;n<e;++n)r+=this.hammingWeight(0|t.words[n]);}else {const e=this.words.length;for(let n=t.words.length;n<e;++n)r+=this.hammingWeight(0|this.words[n]);}return r};var xn=On;const An=function(t,e){if(!t||"object"!=typeof t)throw new Error("Invalid facets_data provided.");if(!e||"object"!=typeof e)return null;const r=Object.entries(e).flatMap(([t,e])=>Array.isArray(e)?e.map(e=>({field:t,filter:e})):[]);return 0===r.length?null:r.reduce((e,{field:r,filter:n})=>{var o;const i=(null==(o=t[r])?void 0:o[n])||new xn([]);return e.new_union(i)},new xn([]))},kn=function(e,r,n){let o=1;return i=e.bits_data_temp,s=(e,i)=>{let s,a,c,u,l,h,f;n[i]&&(s=n[i].order,a=n[i].sort,c=n[i].size,u=n[i].title,l=n[i].show_facet_stats||!1,h=!1!==n[i].chosen_filters_on_top,f=n[i].hide_zero_doc_count||!1);let d,p,g,w=Object.entries(e).map(t=>{let e=[];r&&r.filters&&r.filters[i]&&(e=r.filters[i]);const n=t[1].array().length,o=e.some(e=>String(e)===String(t[0]));if(!f||0!==n||o)return {key:t[0],doc_count:n,selected:o}}).filter(Boolean);if(y(a)?(d=a||["key"],p=s||["asc"]):("term"===a||"key"===a?(d=["key"],p=[s||"asc"]):(d=["doc_count","key"],p=[s||"desc","asc"]),h&&(d.unshift("selected"),p.unshift("desc"))),w=jn(w,d,p),w=w.slice(0,c||10),l){const t=[];Object.entries(e).forEach(e=>{if(isNaN(e[0]))throw new Error("You cant use chars to calculate the facet_stats.");e[1].array().length>0&&e[1].forEach(()=>{t.push(parseInt(e[0]));});}),g={min:(v=t,v&&v.length?vn(v,sn(void 0),wn):void 0),max:yn(t),avg:bn(t),sum:Sn(t)};}var v,_;return t({name:i,title:u||(_=i,_.replace(/^[\s_]+|[\s_]+$/g,"").replace(/[_\s]+/g," ").replace(/^[a-z]/,function(t){return t.toUpperCase()})),position:o++,buckets:w},l&&{facet_stats:g})},a={},s=sn(s),an(i,function(t,e,r){tt(a,e,s(t,e,r));}),a;var i,s,a;};function En(t,e){var r=[];return t.forEach(function(t){e.forEach(function(e){r.push(t.concat(e));});}),r}function zn(t){return !!~t.search(/\(|\)/)}function Fn(t,e){for(var r=e.split(" "+t+" "),n=[],o=[],i=0;i<r.length;i++)if(zn(r[i])||o.length>0){o.push(r[i]);var s=""+o;(s.match(/\(/g)||[]).length===(s.match(/\)/g)||[]).length&&(n.push(o.join(" "+t+" ")),o=[]);}else n.push(r[i]);return n}var Pn=function t(e){return function(t){for(var e=t[0],r=1;r<t.length;r++)e=e.concat(t[r]);return e}(Fn("OR",(r=e=function(t){if("("===t.charAt(0))for(var e=0,r=0;r<t.length;r++)if("("===t.charAt(r)?e++:")"===t.charAt(r)&&e--,0===e)return r!==t.length-1?t:t.substring(1,t.length-1);return t}(e),e=r.replace(/[\s]+/g," "))).map(function(e){for(var r=Fn("AND",e),n=[],o=[],i=0;i<r.length;i++)zn(r[i])?n.push(t(r[i])):o.push(r[i]);return n.push([o]),function(t){for(var e=[[]],r=0;r<t.length;r++)e=En(e,t[r]);return e}(n)}));var r;};const Tn=t=>"boolean"==typeof t?t?"AND":"OR":"string"==typeof t&&"OR"===t.toUpperCase()?"OR":"AND",Nn=function(e,r){const n=r&&r.aggregations||{},o=Object.create(null);let i=!1;const s=t({},n);return Object.keys(e||{}).forEach(r=>{var a,c;const u=n[r];if(!u)return;const l=null==(a=e[r])?void 0:a.selected;Array.isArray(l)&&l.length&&(o[r]=l,i=!0);const h=null==(c=e[r])?void 0:c.options;if(h){const e={};if(void 0!==h.conjunction){const t=Tn(h.conjunction);e.conjunction="AND"===t;}"number"==typeof h.size&&(e.size=h.size),"key"===h.sortBy?(e.sort="key",e.order=h.sortDir||u.order):"count"===h.sortBy?(e.sort=void 0,e.order=h.sortDir||u.order):h.sortDir&&(e.order=h.sortDir),"boolean"==typeof h.hideZero&&(e.hide_zero_doc_count=h.hideZero),"boolean"==typeof h.chosenOnTop&&(e.chosen_filters_on_top=h.chosenOnTop),"boolean"==typeof h.showStats&&(e.show_facet_stats=h.showStats),Object.keys(e).length&&(s[r]=t({},n[r],e));}}),{hasFilters:i,filters:i?o:void 0,aggregations:s}};function Mn(t,e,r,n,o){const i=t=>"number"==typeof t?t:parseInt(t,10);let s=i((e=e||Object.create(null)).per_page);(!Number.isFinite(s)||s<0)&&(s=12);let a=i(e.page);(!Number.isFinite(a)||a<1)&&(a=1),0===s&&(a=1);const c=e.is_all_filtered_items||!1;if(!1===r.native_search_enabled&&e.query)throw new Error('The "query" option is not working once native search is disabled');let u=0;const l=(new Date).getTime();let h,f,d,p=o.bits_ids();if(e._ids)h=new xn(e._ids),f=e._ids;else if(e.ids)f=o.internal_ids_from_ids_map(e.ids),e.filter&&(f=t.filter(t=>f.includes(t._id)).filter(e.filter).map(t=>t._id)),h=new xn(f);else if(n&&(e.query||e.filter)){const t=(new Date).getTime();f=n.search(e.query,e.filter),u=(new Date).getTime()-t,h=new xn(f);}let g=(new Date).getTime();const w=o.search(e,{query_ids:h});if(g=(new Date).getTime()-g,h&&(p=h),w.ids&&(p=p.new_intersection(w.ids)),w.not_ids&&(p=p.new_difference(w.not_ids)),0===s&&!c&&!e.sort&&!f){const t=p.array(),n=(new Date).getTime()-l;return {pagination:{per_page:s,page:a,total:t.length},timings:{total:n,facets:g,search:u,sorting:0},data:{items:[],allFilteredItems:null,aggregations:kn(w,e,r.aggregations)}}}let v=!1;const y=(new Date).getTime();let _,b=0,m=p.array();e.sort?(_=m.map(t=>o.get_item(t)),_=function(t,e,r){if(r&&r[e]&&(e=r[e]),e.field){const r=Array.isArray(e.field)?e.field:[e.field],n=Array.isArray(e.order)?e.order:[e.order||"asc"],o=[],i=[];return r.forEach((t,e)=>{o.push(e=>null==e[t]?1:0),i.push("asc"),o.push(t),i.push(n[e]||"asc");}),jn(t,o,i)}return t}(_,e.sort,r.sortings)):f?(m=f.filter(t=>p.has(t)),_=m.slice((a-1)*s,a*s).map(t=>o.get_item(t)),v=!0):_=m.map(t=>o.get_item(t)),v||(d=c?_:null,_=_.slice((a-1)*s,a*s)),b=(new Date).getTime()-y;const j=(new Date).getTime()-l;return {pagination:{per_page:s,page:a,total:m.length},timings:{total:j,facets:g,search:u,sorting:b},data:{items:_,allFilteredItems:d,aggregations:kn(w,e,r.aggregations)}}}var In=function(t){var e={exports:{}};return function(t,e){!function(){var e,r,n,o,i,s,a,c,u,l,h,f,d,p,g,w,v,y,_,b,m,j,S,O,x,A,k,E,z=function(t){var e=new z.Index;return e.pipeline.add(z.trimmer,z.stopWordFilter,z.stemmer),t&&t.call(e,e),e};z.version="1.0.0",z.utils={},z.utils.warn=function(t){return function(e){t.console&&console.warn&&console.warn(e);}}(this),z.utils.asString=function(t){return null==t?"":t.toString()},z.EventEmitter=function(){this.events={};},z.EventEmitter.prototype.addListener=function(){var t=Array.prototype.slice.call(arguments),e=t.pop(),r=t;if("function"!=typeof e)throw new TypeError("last argument must be a function");r.forEach(function(t){this.hasHandler(t)||(this.events[t]=[]),this.events[t].push(e);},this);},z.EventEmitter.prototype.removeListener=function(t,e){if(this.hasHandler(t)){var r=this.events[t].indexOf(e);this.events[t].splice(r,1),this.events[t].length||delete this.events[t];}},z.EventEmitter.prototype.emit=function(t){if(this.hasHandler(t)){var e=Array.prototype.slice.call(arguments,1);this.events[t].forEach(function(t){t.apply(void 0,e);});}},z.EventEmitter.prototype.hasHandler=function(t){return t in this.events},z.tokenizer=function(t){return arguments.length&&null!=t&&null!=t?Array.isArray(t)?t.map(function(t){return z.utils.asString(t).toLowerCase()}):t.toString().trim().toLowerCase().split(z.tokenizer.separator):[]},z.tokenizer.separator=/[\s\-]+/,z.tokenizer.load=function(t){var e=this.registeredFunctions[t];if(!e)throw new Error("Cannot load un-registered function: "+t);return e},z.tokenizer.label="default",z.tokenizer.registeredFunctions={default:z.tokenizer},z.tokenizer.registerFunction=function(t,e){e in this.registeredFunctions&&z.utils.warn("Overwriting existing tokenizer: "+e),t.label=e,this.registeredFunctions[e]=t;},z.Pipeline=function(){this._stack=[];},z.Pipeline.registeredFunctions={},z.Pipeline.registerFunction=function(t,e){e in this.registeredFunctions&&z.utils.warn("Overwriting existing registered function: "+e),t.label=e,z.Pipeline.registeredFunctions[t.label]=t;},z.Pipeline.warnIfFunctionNotRegistered=function(t){t.label&&t.label in this.registeredFunctions||z.utils.warn("Function is not registered with pipeline. This may cause problems when serialising the index.\n",t);},z.Pipeline.load=function(t){var e=new z.Pipeline;return t.forEach(function(t){var r=z.Pipeline.registeredFunctions[t];if(!r)throw new Error("Cannot load un-registered function: "+t);e.add(r);}),e},z.Pipeline.prototype.add=function(){Array.prototype.slice.call(arguments).forEach(function(t){z.Pipeline.warnIfFunctionNotRegistered(t),this._stack.push(t);},this);},z.Pipeline.prototype.after=function(t,e){z.Pipeline.warnIfFunctionNotRegistered(e);var r=this._stack.indexOf(t);if(-1==r)throw new Error("Cannot find existingFn");this._stack.splice(r+=1,0,e);},z.Pipeline.prototype.before=function(t,e){z.Pipeline.warnIfFunctionNotRegistered(e);var r=this._stack.indexOf(t);if(-1==r)throw new Error("Cannot find existingFn");this._stack.splice(r,0,e);},z.Pipeline.prototype.remove=function(t){var e=this._stack.indexOf(t);-1!=e&&this._stack.splice(e,1);},z.Pipeline.prototype.run=function(t){for(var e=[],r=t.length,n=this._stack.length,o=0;o<r;o++){for(var i=t[o],s=0;s<n&&void 0!==(i=this._stack[s](i,o,t))&&""!==i;s++);void 0!==i&&""!==i&&e.push(i);}return e},z.Pipeline.prototype.reset=function(){this._stack=[];},z.Pipeline.prototype.toJSON=function(){return this._stack.map(function(t){return z.Pipeline.warnIfFunctionNotRegistered(t),t.label})},z.Vector=function(){this._magnitude=null,this.list=void 0,this.length=0;},z.Vector.Node=function(t,e,r){this.idx=t,this.val=e,this.next=r;},z.Vector.prototype.insert=function(t,e){this._magnitude=void 0;var r=this.list;if(!r)return this.list=new z.Vector.Node(t,e,r),this.length++;if(t<r.idx)return this.list=new z.Vector.Node(t,e,r),this.length++;for(var n=r,o=r.next;null!=o;){if(t<o.idx)return n.next=new z.Vector.Node(t,e,o),this.length++;n=o,o=o.next;}return n.next=new z.Vector.Node(t,e,o),this.length++},z.Vector.prototype.magnitude=function(){if(this._magnitude)return this._magnitude;for(var t,e=this.list,r=0;e;)r+=(t=e.val)*t,e=e.next;return this._magnitude=Math.sqrt(r)},z.Vector.prototype.dot=function(t){for(var e=this.list,r=t.list,n=0;e&&r;)e.idx<r.idx?e=e.next:(e.idx>r.idx||(n+=e.val*r.val,e=e.next),r=r.next);return n},z.Vector.prototype.similarity=function(t){return this.dot(t)/(this.magnitude()*t.magnitude())},z.SortedSet=function(){this.length=0,this.elements=[];},z.SortedSet.load=function(t){var e=new this;return e.elements=t,e.length=t.length,e},z.SortedSet.prototype.add=function(){var t,e;for(t=0;t<arguments.length;t++)~this.indexOf(e=arguments[t])||this.elements.splice(this.locationFor(e),0,e);this.length=this.elements.length;},z.SortedSet.prototype.toArray=function(){return this.elements.slice()},z.SortedSet.prototype.map=function(t,e){return this.elements.map(t,e)},z.SortedSet.prototype.forEach=function(t,e){return this.elements.forEach(t,e)},z.SortedSet.prototype.indexOf=function(t){for(var e=0,r=this.elements.length,n=r-e,o=e+Math.floor(n/2),i=this.elements[o];n>1;){if(i===t)return o;i<t&&(e=o),i>t&&(r=o),n=r-e,o=e+Math.floor(n/2),i=this.elements[o];}return i===t?o:-1},z.SortedSet.prototype.locationFor=function(t){for(var e=0,r=this.elements.length,n=r-e,o=e+Math.floor(n/2),i=this.elements[o];n>1;)i<t&&(e=o),i>t&&(r=o),n=r-e,o=e+Math.floor(n/2),i=this.elements[o];return i>t?o:i<t?o+1:void 0},z.SortedSet.prototype.intersect=function(t){for(var e=new z.SortedSet,r=0,n=0,o=this.length,i=t.length,s=this.elements,a=t.elements;!(r>o-1||n>i-1);)s[r]!==a[n]?s[r]<a[n]?r++:s[r]>a[n]&&n++:(e.add(s[r]),r++,n++);return e},z.SortedSet.prototype.clone=function(){var t=new z.SortedSet;return t.elements=this.toArray(),t.length=t.elements.length,t},z.SortedSet.prototype.union=function(t){var e,r,n;this.length>=t.length?(e=this,r=t):(e=t,r=this),n=e.clone();for(var o=0,i=r.toArray();o<i.length;o++)n.add(i[o]);return n},z.SortedSet.prototype.toJSON=function(){return this.toArray()},z.Index=function(){this._fields=[],this._ref="id",this.pipeline=new z.Pipeline,this.documentStore=new z.Store,this.tokenStore=new z.TokenStore,this.corpusTokens=new z.SortedSet,this.eventEmitter=new z.EventEmitter,this.tokenizerFn=z.tokenizer,this._idfCache={},this.on("add","remove","update",function(){this._idfCache={};}.bind(this));},z.Index.prototype.on=function(){var t=Array.prototype.slice.call(arguments);return this.eventEmitter.addListener.apply(this.eventEmitter,t)},z.Index.prototype.off=function(t,e){return this.eventEmitter.removeListener(t,e)},z.Index.load=function(t){t.version!==z.version&&z.utils.warn("version mismatch: current "+z.version+" importing "+t.version);var e=new this;return e._fields=t.fields,e._ref=t.ref,e.tokenizer(z.tokenizer.load(t.tokenizer)),e.documentStore=z.Store.load(t.documentStore),e.tokenStore=z.TokenStore.load(t.tokenStore),e.corpusTokens=z.SortedSet.load(t.corpusTokens),e.pipeline=z.Pipeline.load(t.pipeline),e},z.Index.prototype.field=function(t,e){return this._fields.push({name:t,boost:(e=e||{}).boost||1}),this},z.Index.prototype.ref=function(t){return this._ref=t,this},z.Index.prototype.tokenizer=function(t){return t.label&&t.label in z.tokenizer.registeredFunctions||z.utils.warn("Function is not a registered tokenizer. This may cause problems when serialising the index"),this.tokenizerFn=t,this},z.Index.prototype.add=function(t,e){var r={},n=new z.SortedSet,o=t[this._ref];e=void 0===e||e,this._fields.forEach(function(e){var o=this.pipeline.run(this.tokenizerFn(t[e.name]));r[e.name]=o;for(var i=0;i<o.length;i++){var s=o[i];n.add(s),this.corpusTokens.add(s);}},this),this.documentStore.set(o,n);for(var i=0;i<n.length;i++){for(var s=n.elements[i],a=0,c=0;c<this._fields.length;c++){var u=this._fields[c],l=r[u.name],h=l.length;if(h){for(var f=0,d=0;d<h;d++)l[d]===s&&f++;a+=f/h*u.boost;}}this.tokenStore.add(s,{ref:o,tf:a});}e&&this.eventEmitter.emit("add",t,this);},z.Index.prototype.remove=function(t,e){var r=t[this._ref];if(e=void 0===e||e,this.documentStore.has(r)){var n=this.documentStore.get(r);this.documentStore.remove(r),n.forEach(function(t){this.tokenStore.remove(t,r);},this),e&&this.eventEmitter.emit("remove",t,this);}},z.Index.prototype.update=function(t,e){e=void 0===e||e,this.remove(t,!1),this.add(t,!1),e&&this.eventEmitter.emit("update",t,this);},z.Index.prototype.idf=function(t){var e="@"+t;if(Object.prototype.hasOwnProperty.call(this._idfCache,e))return this._idfCache[e];var r=this.tokenStore.count(t),n=1;return r>0&&(n=1+Math.log(this.documentStore.length/r)),this._idfCache[e]=n},z.Index.prototype.search=function(t){var e=this.pipeline.run(this.tokenizerFn(t)),r=new z.Vector,n=[],o=this._fields.reduce(function(t,e){return t+e.boost},0);return e.some(function(t){return this.tokenStore.has(t)},this)?(e.forEach(function(t,e,i){var s=1/i.length*this._fields.length*o,a=this,c=this.tokenStore.expand(t).reduce(function(e,n){var o=a.corpusTokens.indexOf(n),i=a.idf(n),c=1,u=new z.SortedSet;if(n!==t){var l=Math.max(3,n.length-t.length);c=1/Math.log(l);}o>-1&&r.insert(o,s*i*c);for(var h=a.tokenStore.get(n),f=Object.keys(h),d=f.length,p=0;p<d;p++)u.add(h[f[p]].ref);return e.union(u)},new z.SortedSet);n.push(c);},this),n.reduce(function(t,e){return t.intersect(e)}).map(function(t){return {ref:t,score:r.similarity(this.documentVector(t))}},this).sort(function(t,e){return e.score-t.score})):[]},z.Index.prototype.documentVector=function(t){for(var e=this.documentStore.get(t),r=e.length,n=new z.Vector,o=0;o<r;o++){var i=e.elements[o],s=this.tokenStore.get(i)[t].tf,a=this.idf(i);n.insert(this.corpusTokens.indexOf(i),s*a);}return n},z.Index.prototype.toJSON=function(){return {version:z.version,fields:this._fields,ref:this._ref,tokenizer:this.tokenizerFn.label,documentStore:this.documentStore.toJSON(),tokenStore:this.tokenStore.toJSON(),corpusTokens:this.corpusTokens.toJSON(),pipeline:this.pipeline.toJSON()}},z.Index.prototype.use=function(t){var e=Array.prototype.slice.call(arguments,1);e.unshift(this),t.apply(this,e);},z.Store=function(){this.store={},this.length=0;},z.Store.load=function(t){var e=new this;return e.length=t.length,e.store=Object.keys(t.store).reduce(function(e,r){return e[r]=z.SortedSet.load(t.store[r]),e},{}),e},z.Store.prototype.set=function(t,e){this.has(t)||this.length++,this.store[t]=e;},z.Store.prototype.get=function(t){return this.store[t]},z.Store.prototype.has=function(t){return t in this.store},z.Store.prototype.remove=function(t){this.has(t)&&(delete this.store[t],this.length--);},z.Store.prototype.toJSON=function(){return {store:this.store,length:this.length}},z.stemmer=(e={ational:"ate",tional:"tion",enci:"ence",anci:"ance",izer:"ize",bli:"ble",alli:"al",entli:"ent",eli:"e",ousli:"ous",ization:"ize",ation:"ate",ator:"ate",alism:"al",iveness:"ive",fulness:"ful",ousness:"ous",aliti:"al",iviti:"ive",biliti:"ble",logi:"log"},r={icate:"ic",ative:"",alize:"al",iciti:"ic",ical:"ic",ful:"",ness:""},s="^("+(o="[^aeiou][^aeiouy]*")+")?"+(i=(n="[aeiouy]")+"[aeiou]*")+o+"("+i+")?$",a="^("+o+")?"+i+o+i+o,c="^("+o+")?"+n,u=new RegExp("^("+o+")?"+i+o),l=new RegExp(a),h=new RegExp(s),f=new RegExp(c),d=/^(.+?)(ss|i)es$/,p=/^(.+?)([^s])s$/,g=/^(.+?)eed$/,w=/^(.+?)(ed|ing)$/,v=/.$/,y=/(at|bl|iz)$/,_=new RegExp("([^aeiouylsz])\\1$"),b=new RegExp("^"+o+n+"[^aeiouwxy]$"),m=/^(.+?[^aeiou])y$/,j=/^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/,S=/^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/,O=/^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/,x=/^(.+?)(s|t)(ion)$/,A=/^(.+?)e$/,k=/ll$/,E=new RegExp("^"+o+n+"[^aeiouwxy]$"),function(t){var n,o,i,s,a,c,z;if(t.length<3)return t;if("y"==(i=t.substr(0,1))&&(t=i.toUpperCase()+t.substr(1)),a=p,(s=d).test(t)?t=t.replace(s,"$1$2"):a.test(t)&&(t=t.replace(a,"$1$2")),a=w,(s=g).test(t)){var F=s.exec(t);(s=u).test(F[1])&&(t=t.replace(s=v,""));}else a.test(t)&&(F=a.exec(t),(a=f).test(n=F[1])&&(c=_,z=b,(a=y).test(t=n)?t+="e":c.test(t)?t=t.replace(s=v,""):z.test(t)&&(t+="e")));return (s=m).test(t)&&(t=(n=(F=s.exec(t))[1])+"i"),(s=j).test(t)&&(o=(F=s.exec(t))[2],(s=u).test(n=F[1])&&(t=n+e[o])),(s=S).test(t)&&(o=(F=s.exec(t))[2],(s=u).test(n=F[1])&&(t=n+r[o])),a=x,(s=O).test(t)?(F=s.exec(t),(s=l).test(n=F[1])&&(t=n)):a.test(t)&&(F=a.exec(t),(a=l).test(n=F[1]+F[2])&&(t=n)),(s=A).test(t)&&(F=s.exec(t),a=h,c=E,((s=l).test(n=F[1])||a.test(n)&&!c.test(n))&&(t=n)),a=l,(s=k).test(t)&&a.test(t)&&(t=t.replace(s=v,"")),"y"==i&&(t=i.toLowerCase()+t.substr(1)),t}),z.Pipeline.registerFunction(z.stemmer,"stemmer"),z.generateStopWordFilter=function(t){var e=t.reduce(function(t,e){return t[e]=e,t},{});return function(t){if(t&&e[t]!==t)return t}},z.stopWordFilter=z.generateStopWordFilter(["a","able","about","across","after","all","almost","also","am","among","an","and","any","are","as","at","be","because","been","but","by","can","cannot","could","dear","did","do","does","either","else","ever","every","for","from","get","got","had","has","have","he","her","hers","him","his","how","however","i","if","in","into","is","it","its","just","least","let","like","likely","may","me","might","most","must","my","neither","no","nor","not","of","off","often","on","only","or","other","our","own","rather","said","say","says","she","should","since","so","some","than","that","the","their","them","then","there","these","they","this","tis","to","too","twas","us","wants","was","we","were","what","when","where","which","while","who","whom","why","will","with","would","yet","you","your"]),z.Pipeline.registerFunction(z.stopWordFilter,"stopWordFilter"),z.trimmer=function(t){return t.replace(/^\W+/,"").replace(/\W+$/,"")},z.Pipeline.registerFunction(z.trimmer,"trimmer"),z.TokenStore=function(){this.root={docs:{}},this.length=0;},z.TokenStore.load=function(t){var e=new this;return e.root=t.root,e.length=t.length,e},z.TokenStore.prototype.add=function(t,e,r){r=r||this.root;var n=t.charAt(0),o=t.slice(1);return n in r||(r[n]={docs:{}}),0===o.length?(r[n].docs[e.ref]=e,void(this.length+=1)):this.add(o,e,r[n])},z.TokenStore.prototype.has=function(t){if(!t)return !1;for(var e=this.root,r=0;r<t.length;r++){if(!e[t.charAt(r)])return !1;e=e[t.charAt(r)];}return !0},z.TokenStore.prototype.getNode=function(t){if(!t)return {};for(var e=this.root,r=0;r<t.length;r++){if(!e[t.charAt(r)])return {};e=e[t.charAt(r)];}return e},z.TokenStore.prototype.get=function(t,e){return this.getNode(t,e).docs||{}},z.TokenStore.prototype.count=function(t,e){return Object.keys(this.get(t,e)).length},z.TokenStore.prototype.remove=function(t,e){if(t){for(var r=this.root,n=0;n<t.length;n++){if(!(t.charAt(n)in r))return;r=r[t.charAt(n)];}delete r.docs[e];}},z.TokenStore.prototype.expand=function(t,e){var r=this.getNode(t);return e=e||[],Object.keys(r.docs||{}).length&&e.push(t),Object.keys(r).forEach(function(r){"docs"!==r&&e.concat(this.expand(t+r,e));},this),e},z.TokenStore.prototype.toJSON=function(){return {root:this.root,length:this.length}},t.exports=z;}();}(e),e.exports}();class $n{constructor(t,e){if(this.store=new Map,null!=e&&e.fulltextSnapshot){const t=JSON.parse(JSON.stringify(e.fulltextSnapshot.index));return this.idx=In.Index.load(t),void(this.store=new Map(e.fulltextSnapshot.store))}this.idx=In(function(){this.field("name",{boost:10}),((null==e?void 0:e.searchableFields)||[]).forEach(t=>this.field(t)),this.ref("_id"),null!=e&&e.isExactSearch&&(this.pipeline.remove(In.stemmer),this.pipeline.remove(In.stopWordFilter)),null!=e&&e.removeStopWordFilter&&this.pipeline.remove(In.stopWordFilter);});let r=1;(t||[]).map(t=>{null==t._id&&(t._id=r),++r,this.idx.add(t),this.store.set(t._id,t);});}serialize(){return {index:JSON.parse(JSON.stringify(this.idx)),store:[...this.store.entries()]}}search_full(t,e){return this.search(t,e).map(t=>this.store.get(t))}search(t,e){return e instanceof Function?(t?this.idx.search(t).map(t=>this.store.get(t.ref)):[...this.store.values()]).filter(e).map(t=>t._id):t?this.idx.search(t).map(t=>t.ref):[...this.store.keys()]}}class Dn{constructor(t,e){(e=e||Object.create(null)).aggregations=e.aggregations||Object.create(null),this._items=t,this.config=e.aggregations;const r=e.custom_id_field||"id";this.facets=e.facetsSnapshot?this._loadFromSnapshot(e.facetsSnapshot):function(t=[],e=[]){const r={data:Object.create(null),bits_data:Object.create(null),bits_data_temp:Object.create(null)};let n=1;return e.forEach(t=>{r.data[t]=Object.create(null);}),t.forEach(t=>{t._id||(t._id=n++);}),t.forEach(t=>{e.forEach(e=>{const n=t[e];if(Array.isArray(n))n.forEach(n=>{r.data[e][n]||(r.data[e][n]=[]),r.data[e][n].push(t._id);});else if(void 0!==n){const o=n;r.data[e][o]||(r.data[e][o]=[]),r.data[e][o].push(t._id);}});}),Object.keys(r.data).forEach(t=>{r.bits_data[t]=Object.create(null),r.bits_data_temp[t]=Object.create(null);const e=r.data[t];Object.keys(e).forEach(n=>{const o=e[n].sort((t,e)=>t-e);r.bits_data[t][n]=new xn(o),r.data[t][n]=o;});}),r}(t,Nt(e.aggregations)),this._items_map=Object.create(null),this._ids=[];let n=1;var o,i;i=t=>{var o,i;if(null!=(o=e.facetsSnapshot)&&o.idsMap&&t[r]){const n=e.facetsSnapshot.idsMap[t[r]];void 0!==n&&(t._id=n);}else null!=(i=e.facetsSnapshot)&&i.ids&&e.facetsSnapshot.ids.length>=n?t._id=e.facetsSnapshot.ids[n-1]:null==t._id&&(t._id=n);this._ids.push(t._id),this._items_map[t._id]=t,++n;},(y(o=t)?v:ln)(o,sn(i)),this.ids_map=Object.create(null),t&&t.forEach(t=>{t[r]&&t._id&&(this.ids_map[t[r]]=t._id);}),this._bits_ids=new xn(this._ids);}items(){return this._items}bits_ids(t){return t?new xn(t):this._bits_ids}internal_ids_from_ids_map(t){return t.map(t=>this.ids_map[t])}index(){return this.facets}serialize(){var t;const e=Object.create(null);if(null!=(t=this.facets)&&t.bits_data)for(const t in this.facets.bits_data){e[t]=Object.create(null);for(const r in this.facets.bits_data[t])e[t][r]=this.facets.bits_data[t][r].array();}return {bitsData:e,ids:this._ids,idsMap:this.ids_map}}get_item(t){return this._items_map[t]}search(t,e={}){const r=this.config,n={};n.not_ids=An(this.facets.bits_data,t.not_filters);const o=function(t,e){const r=[];for(const o in t.filters){const i=t.filters[o];var n;if(i&&i.length)if(!1!==(null==(n=e[o])?void 0:n.conjunction))i.forEach(t=>{r.push([o,t]);});else {const t=i.map(t=>[o,t]);r.push(t);}}for(const e in t.not_filters){const n=t.not_filters[e];n&&n.length&&n.forEach(t=>{r.push([e,"-",t]);});}return r}(t,r);let i=function(t,e=[]){const r=br(t);r.bits_data_temp={};for(const t in r.bits_data){r.bits_data_temp[t]={};for(const e in r.bits_data[t])r.bits_data_temp[t][e]=r.bits_data[t][e];}let n;r.is_temp_copied=!0;const o=function(t,e){const r={};return e.forEach(e=>{if(Array.isArray(e[0])){let n=new xn;const o=new Set;e.forEach(e=>{var r;const[i,s]=e;o.add(i);const a=(null==(r=t.bits_data[i])?void 0:r[s])||new xn;n=n.new_union(a);}),o.forEach(t=>{r[t]=n;});}}),r}(t,e);if(e.forEach(t=>{if(!Array.isArray(t[0])){var e;const[o,i]=t,s=null==(e=r.bits_data_temp[o])?void 0:e[i];n=n&&s?s.new_intersection(n):n&&!s?new xn([]):s;}}),n)for(const t in r.bits_data_temp)for(const e in r.bits_data_temp[t])r.bits_data_temp[t][e]=r.bits_data_temp[t][e].new_intersection(n);e.forEach(t=>{if(3===t.length&&"-"===t[1]){var e,n;const[o,,i]=t,s=(null==(e=r.bits_data_temp[o])||null==(n=e[i])?void 0:n.clone())||new xn;for(const t in r.bits_data_temp)for(const e in r.bits_data_temp[t])r.bits_data_temp[t][e]=r.bits_data_temp[t][e].new_difference(s);}});for(const t in r.bits_data_temp)for(const e in r.bits_data_temp[t])for(const n in o)n!==t&&(r.bits_data_temp[t][e]=r.bits_data_temp[t][e].new_intersection(o[n]));return r}(this.facets,o);t.filters_query&&(i=function(t,e){const r=br(t);if(r.bits_data_temp||(r.bits_data_temp={}),!r.is_temp_copied)for(const t in r.bits_data){r.bits_data_temp[t]={};for(const e in r.bits_data[t])r.bits_data_temp[t][e]=r.bits_data[t][e];}let n=null;if(Array.isArray(e)&&e.forEach(t=>{let e=null;t.forEach(t=>{const[n,o]=t;if(!r.bits_data_temp[n])throw new Error("Panic. The key does not exist in facets lists.");const i=r.bits_data_temp[n][o];e=i?e?e.new_intersection(i):i:new xn;}),e&&(n=n?n.new_union(e):e);}),null!==n)for(const t in r.bits_data_temp)for(const e in r.bits_data_temp[t])r.bits_data_temp[t][e]=r.bits_data_temp[t][e].new_intersection(n);return r}(i,Pn(t.filters_query).map(t=>Array.isArray(t)?t.map(t=>Array.isArray(t)?t.map(t=>t):t.split(":")):t.split(":")))),n.bits_data_temp=i.bits_data_temp;const s=n.bits_data_temp;if(e.query_ids)for(const t in s)for(const r in s[t])s[t][r]=e.query_ids.new_intersection(s[t][r]);if(e.test){n.data={};for(const t in s){n.data[t]={};for(const e in s[t])n.data[t][e]=s[t][e].array();}}return n.ids=t.filters_query?Object.values(s).reduce((t,e)=>(Object.values(e).forEach(e=>{t=t.new_union(e);}),t),new xn([])):An(s,t.filters),n}_loadFromSnapshot(t){const e={data:Object.create(null),bits_data:Object.create(null),bits_data_temp:Object.create(null)};if(t.bitsData)for(const r in t.bitsData){e.bits_data[r]=Object.create(null);for(const n in t.bitsData[r])e.bits_data[r][n]=new xn(t.bitsData[r][n]);}return e}}function Wn(e,r){let n;!1!==(r=r||Object.create(null)).native_search_enabled&&(n=new $n(e,r));let o=new Dn(e,r);return {search:function(i){var s;i=i||Object.create(null);let a=r;if(i.facets){const{aggregations:e,filters:n}=Nn(i.facets,r);if(a=t({},r,{aggregations:e}),n&&(i.filters=t({},i.filters||{},n)),!i.filters_query){const t=function(t,e){if(!t||"object"!=typeof t)return;const r=e&&e.aggregations||{},n=[];return Object.keys(t).forEach(e=>{var o,i,s;if(!r[e])return;const a=(null==(o=t[e])?void 0:o.selected)||[];if(!Array.isArray(a)||0===a.length)return;const c=Tn(null==(i=t[e])||null==(s=i.options)?void 0:s.conjunction),u=a.map(t=>{const r=String(t);return r.includes(" ")||r.includes(":")?`${e}:"${r.replace(/"/g,'\\"')}"`:`${e}:${r}`});let l;l="OR"===c?u.length>1?`(${u.join(" OR ")})`:u[0]:u.join(" AND "),n.push(l);}),n.length?n.join(" AND "):void 0}(i.facets,a);t&&(i.filters_query=t);}o.config=a.aggregations;}else o.config=r.aggregations;i.aggregations=function(e,r){const n={};for(const o in e){const i=t({},e[o]);i.field=i.field||o,i.filters=r.filters&&r.filters[o]||[],i.not_filters=r.exclude_filters&&r.exclude_filters[o]||r.not_filters&&r.not_filters[o]||[],n[o]=i;}return n}(a.aggregations,i);const c=Mn(e,i,a,n,o);return null!=c&&null!=(s=c.data)&&s.aggregations&&!c.data.facets&&(c.data.facets=c.data.aggregations),c},similar:function(r,n){return function(e,r,n){const o=(n=n||Object.create(null)).per_page||10,i=n.minimum||0,s=n.page||1;let a;for(let t=0;t<e.length;++t)if(e[t].id==r){a=e[t];break}if(!a)return {pagination:{per_page:o,page:s,total:0},data:{items:[]}};if(!n.field)throw new Error("Please define field in options");const c=n.field;let u=[];for(let n=0;n<e.length;++n)if(e[n].id!==r){const r=gn(a[c],e[n][c]);r.length>=i&&u.push(t({},e[n],{intersection_length:r.length}));}return u=jn(u,["intersection_length"],["desc"]),{pagination:{per_page:o,page:s,total:u.length},data:{items:u.slice((s-1)*o,s*o)}}}(e,r,n)},aggregation:function(i){let s=r;if(null!=i&&i.facets){const{aggregations:e}=Nn(i.facets,r);s=t({},r,{aggregations:e}),o.config=s.aggregations;}else o.config=r.aggregations;return function(e,r,n,o,i){const s=r.per_page||10,a=r.page||1;if(r.name&&(!n.aggregations||!n.aggregations[r.name]))throw new Error('Please define aggregation "'.concat(r.name,'" in config'));const c=function(t){try{return structuredClone(t)}catch(e){try{return JSON.parse(JSON.stringify(t))}catch(e){return t}}}(r);if(c.page=1,c.per_page=0,!r.name)throw new Error("field name is required");const u=Mn(e,c,t({},n,{aggregations:t({},n.aggregations,{[r.name]:t({},n.aggregations[r.name],{size:1e4})})}),o,i).data.aggregations[r.name].buckets;return {pagination:{per_page:s,page:a,total:u.length},data:{buckets:u.slice((a-1)*s,a*s)}}}(e,i,s,n,o)},reindex:function(t){n=new $n(e=t,r),o=new Dn(e,r);},serializeFulltext:function(){return n?n.serialize():null},serializeFacets:function(){return o.serialize()},serializeAll:function(){return {version:"itemsjs-snapshot-v1",fulltext:this.serializeFulltext(),facets:this.serializeFacets()}}}}

    /** @ignore */
    const ENTRIES = 'ENTRIES';
    /** @ignore */
    const KEYS = 'KEYS';
    /** @ignore */
    const VALUES = 'VALUES';
    /** @ignore */
    const LEAF = '';
    /**
     * @private
     */
    class TreeIterator {
        constructor(set, type) {
            const node = set._tree;
            const keys = Array.from(node.keys());
            this.set = set;
            this._type = type;
            this._path = keys.length > 0 ? [{ node, keys }] : [];
        }
        next() {
            const value = this.dive();
            this.backtrack();
            return value;
        }
        dive() {
            if (this._path.length === 0) {
                return { done: true, value: undefined };
            }
            const { node, keys } = last$1(this._path);
            if (last$1(keys) === LEAF) {
                return { done: false, value: this.result() };
            }
            const child = node.get(last$1(keys));
            this._path.push({ node: child, keys: Array.from(child.keys()) });
            return this.dive();
        }
        backtrack() {
            if (this._path.length === 0) {
                return;
            }
            const keys = last$1(this._path).keys;
            keys.pop();
            if (keys.length > 0) {
                return;
            }
            this._path.pop();
            this.backtrack();
        }
        key() {
            return this.set._prefix + this._path
                .map(({ keys }) => last$1(keys))
                .filter(key => key !== LEAF)
                .join('');
        }
        value() {
            return last$1(this._path).node.get(LEAF);
        }
        result() {
            switch (this._type) {
                case VALUES: return this.value();
                case KEYS: return this.key();
                default: return [this.key(), this.value()];
            }
        }
        [Symbol.iterator]() {
            return this;
        }
    }
    const last$1 = (array) => {
        return array[array.length - 1];
    };

    /* eslint-disable no-labels */
    /**
     * @ignore
     */
    const fuzzySearch = (node, query, maxDistance) => {
        const results = new Map();
        if (query === undefined)
            return results;
        // Number of columns in the Levenshtein matrix.
        const n = query.length + 1;
        // Matching terms can never be longer than N + maxDistance.
        const m = n + maxDistance;
        // Fill first matrix row and column with numbers: 0 1 2 3 ...
        const matrix = new Uint8Array(m * n).fill(maxDistance + 1);
        for (let j = 0; j < n; ++j)
            matrix[j] = j;
        for (let i = 1; i < m; ++i)
            matrix[i * n] = i;
        recurse(node, query, maxDistance, results, matrix, 1, n, '');
        return results;
    };
    // Modified version of http://stevehanov.ca/blog/?id=114
    // This builds a Levenshtein matrix for a given query and continuously updates
    // it for nodes in the radix tree that fall within the given maximum edit
    // distance. Keeping the same matrix around is beneficial especially for larger
    // edit distances.
    //
    //           k   a   t   e   <-- query
    //       0   1   2   3   4
    //   c   1   1   2   3   4
    //   a   2   2   1   2   3
    //   t   3   3   2   1  [2]  <-- edit distance
    //   ^
    //   ^ term in radix tree, rows are added and removed as needed
    const recurse = (node, query, maxDistance, results, matrix, m, n, prefix) => {
        const offset = m * n;
        key: for (const key of node.keys()) {
            if (key === LEAF) {
                // We've reached a leaf node. Check if the edit distance acceptable and
                // store the result if it is.
                const distance = matrix[offset - 1];
                if (distance <= maxDistance) {
                    results.set(prefix, [node.get(key), distance]);
                }
            }
            else {
                // Iterate over all characters in the key. Update the Levenshtein matrix
                // and check if the minimum distance in the last row is still within the
                // maximum edit distance. If it is, we can recurse over all child nodes.
                let i = m;
                for (let pos = 0; pos < key.length; ++pos, ++i) {
                    const char = key[pos];
                    const thisRowOffset = n * i;
                    const prevRowOffset = thisRowOffset - n;
                    // Set the first column based on the previous row, and initialize the
                    // minimum distance in the current row.
                    let minDistance = matrix[thisRowOffset];
                    const jmin = Math.max(0, i - maxDistance - 1);
                    const jmax = Math.min(n - 1, i + maxDistance);
                    // Iterate over remaining columns (characters in the query).
                    for (let j = jmin; j < jmax; ++j) {
                        const different = char !== query[j];
                        // It might make sense to only read the matrix positions used for
                        // deletion/insertion if the characters are different. But we want to
                        // avoid conditional reads for performance reasons.
                        const rpl = matrix[prevRowOffset + j] + +different;
                        const del = matrix[prevRowOffset + j + 1] + 1;
                        const ins = matrix[thisRowOffset + j] + 1;
                        const dist = matrix[thisRowOffset + j + 1] = Math.min(rpl, del, ins);
                        if (dist < minDistance)
                            minDistance = dist;
                    }
                    // Because distance will never decrease, we can stop. There will be no
                    // matching child nodes.
                    if (minDistance > maxDistance) {
                        continue key;
                    }
                }
                recurse(node.get(key), query, maxDistance, results, matrix, i, n, prefix + key);
            }
        }
    };

    /* eslint-disable no-labels */
    /**
     * A class implementing the same interface as a standard JavaScript
     * [`Map`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
     * with string keys, but adding support for efficiently searching entries with
     * prefix or fuzzy search. This class is used internally by {@link MiniSearch}
     * as the inverted index data structure. The implementation is a radix tree
     * (compressed prefix tree).
     *
     * Since this class can be of general utility beyond _MiniSearch_, it is
     * exported by the `minisearch` package and can be imported (or required) as
     * `minisearch/SearchableMap`.
     *
     * @typeParam T  The type of the values stored in the map.
     */
    class SearchableMap {
        /**
         * The constructor is normally called without arguments, creating an empty
         * map. In order to create a {@link SearchableMap} from an iterable or from an
         * object, check {@link SearchableMap.from} and {@link
         * SearchableMap.fromObject}.
         *
         * The constructor arguments are for internal use, when creating derived
         * mutable views of a map at a prefix.
         */
        constructor(tree = new Map(), prefix = '') {
            this._size = undefined;
            this._tree = tree;
            this._prefix = prefix;
        }
        /**
         * Creates and returns a mutable view of this {@link SearchableMap},
         * containing only entries that share the given prefix.
         *
         * ### Usage:
         *
         * ```javascript
         * let map = new SearchableMap()
         * map.set("unicorn", 1)
         * map.set("universe", 2)
         * map.set("university", 3)
         * map.set("unique", 4)
         * map.set("hello", 5)
         *
         * let uni = map.atPrefix("uni")
         * uni.get("unique") // => 4
         * uni.get("unicorn") // => 1
         * uni.get("hello") // => undefined
         *
         * let univer = map.atPrefix("univer")
         * univer.get("unique") // => undefined
         * univer.get("universe") // => 2
         * univer.get("university") // => 3
         * ```
         *
         * @param prefix  The prefix
         * @return A {@link SearchableMap} representing a mutable view of the original
         * Map at the given prefix
         */
        atPrefix(prefix) {
            if (!prefix.startsWith(this._prefix)) {
                throw new Error('Mismatched prefix');
            }
            const [node, path] = trackDown(this._tree, prefix.slice(this._prefix.length));
            if (node === undefined) {
                const [parentNode, key] = last(path);
                for (const k of parentNode.keys()) {
                    if (k !== LEAF && k.startsWith(key)) {
                        const node = new Map();
                        node.set(k.slice(key.length), parentNode.get(k));
                        return new SearchableMap(node, prefix);
                    }
                }
            }
            return new SearchableMap(node, prefix);
        }
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/clear
         */
        clear() {
            this._size = undefined;
            this._tree.clear();
        }
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/delete
         * @param key  Key to delete
         */
        delete(key) {
            this._size = undefined;
            return remove(this._tree, key);
        }
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/entries
         * @return An iterator iterating through `[key, value]` entries.
         */
        entries() {
            return new TreeIterator(this, ENTRIES);
        }
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/forEach
         * @param fn  Iteration function
         */
        forEach(fn) {
            for (const [key, value] of this) {
                fn(key, value, this);
            }
        }
        /**
         * Returns a Map of all the entries that have a key within the given edit
         * distance from the search key. The keys of the returned Map are the matching
         * keys, while the values are two-element arrays where the first element is
         * the value associated to the key, and the second is the edit distance of the
         * key to the search key.
         *
         * ### Usage:
         *
         * ```javascript
         * let map = new SearchableMap()
         * map.set('hello', 'world')
         * map.set('hell', 'yeah')
         * map.set('ciao', 'mondo')
         *
         * // Get all entries that match the key 'hallo' with a maximum edit distance of 2
         * map.fuzzyGet('hallo', 2)
         * // => Map(2) { 'hello' => ['world', 1], 'hell' => ['yeah', 2] }
         *
         * // In the example, the "hello" key has value "world" and edit distance of 1
         * // (change "e" to "a"), the key "hell" has value "yeah" and edit distance of 2
         * // (change "e" to "a", delete "o")
         * ```
         *
         * @param key  The search key
         * @param maxEditDistance  The maximum edit distance (Levenshtein)
         * @return A Map of the matching keys to their value and edit distance
         */
        fuzzyGet(key, maxEditDistance) {
            return fuzzySearch(this._tree, key, maxEditDistance);
        }
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/get
         * @param key  Key to get
         * @return Value associated to the key, or `undefined` if the key is not
         * found.
         */
        get(key) {
            const node = lookup(this._tree, key);
            return node !== undefined ? node.get(LEAF) : undefined;
        }
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/has
         * @param key  Key
         * @return True if the key is in the map, false otherwise
         */
        has(key) {
            const node = lookup(this._tree, key);
            return node !== undefined && node.has(LEAF);
        }
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/keys
         * @return An `Iterable` iterating through keys
         */
        keys() {
            return new TreeIterator(this, KEYS);
        }
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/set
         * @param key  Key to set
         * @param value  Value to associate to the key
         * @return The {@link SearchableMap} itself, to allow chaining
         */
        set(key, value) {
            if (typeof key !== 'string') {
                throw new Error('key must be a string');
            }
            this._size = undefined;
            const node = createPath(this._tree, key);
            node.set(LEAF, value);
            return this;
        }
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/size
         */
        get size() {
            if (this._size) {
                return this._size;
            }
            /** @ignore */
            this._size = 0;
            const iter = this.entries();
            while (!iter.next().done)
                this._size += 1;
            return this._size;
        }
        /**
         * Updates the value at the given key using the provided function. The function
         * is called with the current value at the key, and its return value is used as
         * the new value to be set.
         *
         * ### Example:
         *
         * ```javascript
         * // Increment the current value by one
         * searchableMap.update('somekey', (currentValue) => currentValue == null ? 0 : currentValue + 1)
         * ```
         *
         * If the value at the given key is or will be an object, it might not require
         * re-assignment. In that case it is better to use `fetch()`, because it is
         * faster.
         *
         * @param key  The key to update
         * @param fn  The function used to compute the new value from the current one
         * @return The {@link SearchableMap} itself, to allow chaining
         */
        update(key, fn) {
            if (typeof key !== 'string') {
                throw new Error('key must be a string');
            }
            this._size = undefined;
            const node = createPath(this._tree, key);
            node.set(LEAF, fn(node.get(LEAF)));
            return this;
        }
        /**
         * Fetches the value of the given key. If the value does not exist, calls the
         * given function to create a new value, which is inserted at the given key
         * and subsequently returned.
         *
         * ### Example:
         *
         * ```javascript
         * const map = searchableMap.fetch('somekey', () => new Map())
         * map.set('foo', 'bar')
         * ```
         *
         * @param key  The key to update
         * @param initial  A function that creates a new value if the key does not exist
         * @return The existing or new value at the given key
         */
        fetch(key, initial) {
            if (typeof key !== 'string') {
                throw new Error('key must be a string');
            }
            this._size = undefined;
            const node = createPath(this._tree, key);
            let value = node.get(LEAF);
            if (value === undefined) {
                node.set(LEAF, value = initial());
            }
            return value;
        }
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/values
         * @return An `Iterable` iterating through values.
         */
        values() {
            return new TreeIterator(this, VALUES);
        }
        /**
         * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map/@@iterator
         */
        [Symbol.iterator]() {
            return this.entries();
        }
        /**
         * Creates a {@link SearchableMap} from an `Iterable` of entries
         *
         * @param entries  Entries to be inserted in the {@link SearchableMap}
         * @return A new {@link SearchableMap} with the given entries
         */
        static from(entries) {
            const tree = new SearchableMap();
            for (const [key, value] of entries) {
                tree.set(key, value);
            }
            return tree;
        }
        /**
         * Creates a {@link SearchableMap} from the iterable properties of a JavaScript object
         *
         * @param object  Object of entries for the {@link SearchableMap}
         * @return A new {@link SearchableMap} with the given entries
         */
        static fromObject(object) {
            return SearchableMap.from(Object.entries(object));
        }
    }
    const trackDown = (tree, key, path = []) => {
        if (key.length === 0 || tree == null) {
            return [tree, path];
        }
        for (const k of tree.keys()) {
            if (k !== LEAF && key.startsWith(k)) {
                path.push([tree, k]); // performance: update in place
                return trackDown(tree.get(k), key.slice(k.length), path);
            }
        }
        path.push([tree, key]); // performance: update in place
        return trackDown(undefined, '', path);
    };
    const lookup = (tree, key) => {
        if (key.length === 0 || tree == null) {
            return tree;
        }
        for (const k of tree.keys()) {
            if (k !== LEAF && key.startsWith(k)) {
                return lookup(tree.get(k), key.slice(k.length));
            }
        }
    };
    // Create a path in the radix tree for the given key, and returns the deepest
    // node. This function is in the hot path for indexing. It avoids unnecessary
    // string operations and recursion for performance.
    const createPath = (node, key) => {
        const keyLength = key.length;
        outer: for (let pos = 0; node && pos < keyLength;) {
            for (const k of node.keys()) {
                // Check whether this key is a candidate: the first characters must match.
                if (k !== LEAF && key[pos] === k[0]) {
                    const len = Math.min(keyLength - pos, k.length);
                    // Advance offset to the point where key and k no longer match.
                    let offset = 1;
                    while (offset < len && key[pos + offset] === k[offset])
                        ++offset;
                    const child = node.get(k);
                    if (offset === k.length) {
                        // The existing key is shorter than the key we need to create.
                        node = child;
                    }
                    else {
                        // Partial match: we need to insert an intermediate node to contain
                        // both the existing subtree and the new node.
                        const intermediate = new Map();
                        intermediate.set(k.slice(offset), child);
                        node.set(key.slice(pos, pos + offset), intermediate);
                        node.delete(k);
                        node = intermediate;
                    }
                    pos += offset;
                    continue outer;
                }
            }
            // Create a final child node to contain the final suffix of the key.
            const child = new Map();
            node.set(key.slice(pos), child);
            return child;
        }
        return node;
    };
    const remove = (tree, key) => {
        const [node, path] = trackDown(tree, key);
        if (node === undefined) {
            return;
        }
        node.delete(LEAF);
        if (node.size === 0) {
            cleanup(path);
        }
        else if (node.size === 1) {
            const [key, value] = node.entries().next().value;
            merge(path, key, value);
        }
    };
    const cleanup = (path) => {
        if (path.length === 0) {
            return;
        }
        const [node, key] = last(path);
        node.delete(key);
        if (node.size === 0) {
            cleanup(path.slice(0, -1));
        }
        else if (node.size === 1) {
            const [key, value] = node.entries().next().value;
            if (key !== LEAF) {
                merge(path.slice(0, -1), key, value);
            }
        }
    };
    const merge = (path, key, value) => {
        if (path.length === 0) {
            return;
        }
        const [node, nodeKey] = last(path);
        node.set(nodeKey + key, value);
        node.delete(nodeKey);
    };
    const last = (array) => {
        return array[array.length - 1];
    };

    const OR = 'or';
    const AND = 'and';
    const AND_NOT = 'and_not';
    /**
     * {@link MiniSearch} is the main entrypoint class, implementing a full-text
     * search engine in memory.
     *
     * @typeParam T  The type of the documents being indexed.
     *
     * ### Basic example:
     *
     * ```javascript
     * const documents = [
     *   {
     *     id: 1,
     *     title: 'Moby Dick',
     *     text: 'Call me Ishmael. Some years ago...',
     *     category: 'fiction'
     *   },
     *   {
     *     id: 2,
     *     title: 'Zen and the Art of Motorcycle Maintenance',
     *     text: 'I can see by my watch...',
     *     category: 'fiction'
     *   },
     *   {
     *     id: 3,
     *     title: 'Neuromancer',
     *     text: 'The sky above the port was...',
     *     category: 'fiction'
     *   },
     *   {
     *     id: 4,
     *     title: 'Zen and the Art of Archery',
     *     text: 'At first sight it must seem...',
     *     category: 'non-fiction'
     *   },
     *   // ...and more
     * ]
     *
     * // Create a search engine that indexes the 'title' and 'text' fields for
     * // full-text search. Search results will include 'title' and 'category' (plus the
     * // id field, that is always stored and returned)
     * const miniSearch = new MiniSearch({
     *   fields: ['title', 'text'],
     *   storeFields: ['title', 'category']
     * })
     *
     * // Add documents to the index
     * miniSearch.addAll(documents)
     *
     * // Search for documents:
     * let results = miniSearch.search('zen art motorcycle')
     * // => [
     * //   { id: 2, title: 'Zen and the Art of Motorcycle Maintenance', category: 'fiction', score: 2.77258 },
     * //   { id: 4, title: 'Zen and the Art of Archery', category: 'non-fiction', score: 1.38629 }
     * // ]
     * ```
     */
    class MiniSearch {
        /**
         * @param options  Configuration options
         *
         * ### Examples:
         *
         * ```javascript
         * // Create a search engine that indexes the 'title' and 'text' fields of your
         * // documents:
         * const miniSearch = new MiniSearch({ fields: ['title', 'text'] })
         * ```
         *
         * ### ID Field:
         *
         * ```javascript
         * // Your documents are assumed to include a unique 'id' field, but if you want
         * // to use a different field for document identification, you can set the
         * // 'idField' option:
         * const miniSearch = new MiniSearch({ idField: 'key', fields: ['title', 'text'] })
         * ```
         *
         * ### Options and defaults:
         *
         * ```javascript
         * // The full set of options (here with their default value) is:
         * const miniSearch = new MiniSearch({
         *   // idField: field that uniquely identifies a document
         *   idField: 'id',
         *
         *   // extractField: function used to get the value of a field in a document.
         *   // By default, it assumes the document is a flat object with field names as
         *   // property keys and field values as string property values, but custom logic
         *   // can be implemented by setting this option to a custom extractor function.
         *   extractField: (document, fieldName) => document[fieldName],
         *
         *   // tokenize: function used to split fields into individual terms. By
         *   // default, it is also used to tokenize search queries, unless a specific
         *   // `tokenize` search option is supplied. When tokenizing an indexed field,
         *   // the field name is passed as the second argument.
         *   tokenize: (string, _fieldName) => string.split(SPACE_OR_PUNCTUATION),
         *
         *   // processTerm: function used to process each tokenized term before
         *   // indexing. It can be used for stemming and normalization. Return a falsy
         *   // value in order to discard a term. By default, it is also used to process
         *   // search queries, unless a specific `processTerm` option is supplied as a
         *   // search option. When processing a term from a indexed field, the field
         *   // name is passed as the second argument.
         *   processTerm: (term, _fieldName) => term.toLowerCase(),
         *
         *   // searchOptions: default search options, see the `search` method for
         *   // details
         *   searchOptions: undefined,
         *
         *   // fields: document fields to be indexed. Mandatory, but not set by default
         *   fields: undefined
         *
         *   // storeFields: document fields to be stored and returned as part of the
         *   // search results.
         *   storeFields: []
         * })
         * ```
         */
        constructor(options) {
            if ((options === null || options === void 0 ? void 0 : options.fields) == null) {
                throw new Error('MiniSearch: option "fields" must be provided');
            }
            const autoVacuum = (options.autoVacuum == null || options.autoVacuum === true) ? defaultAutoVacuumOptions : options.autoVacuum;
            this._options = {
                ...defaultOptions,
                ...options,
                autoVacuum,
                searchOptions: { ...defaultSearchOptions, ...(options.searchOptions || {}) },
                autoSuggestOptions: { ...defaultAutoSuggestOptions, ...(options.autoSuggestOptions || {}) }
            };
            this._index = new SearchableMap();
            this._documentCount = 0;
            this._documentIds = new Map();
            this._idToShortId = new Map();
            // Fields are defined during initialization, don't change, are few in
            // number, rarely need iterating over, and have string keys. Therefore in
            // this case an object is a better candidate than a Map to store the mapping
            // from field key to ID.
            this._fieldIds = {};
            this._fieldLength = new Map();
            this._avgFieldLength = [];
            this._nextId = 0;
            this._storedFields = new Map();
            this._dirtCount = 0;
            this._currentVacuum = null;
            this._enqueuedVacuum = null;
            this._enqueuedVacuumConditions = defaultVacuumConditions;
            this.addFields(this._options.fields);
        }
        /**
         * Adds a document to the index
         *
         * @param document  The document to be indexed
         */
        add(document) {
            const { extractField, stringifyField, tokenize, processTerm, fields, idField } = this._options;
            const id = extractField(document, idField);
            if (id == null) {
                throw new Error(`MiniSearch: document does not have ID field "${idField}"`);
            }
            if (this._idToShortId.has(id)) {
                throw new Error(`MiniSearch: duplicate ID ${id}`);
            }
            const shortDocumentId = this.addDocumentId(id);
            this.saveStoredFields(shortDocumentId, document);
            for (const field of fields) {
                const fieldValue = extractField(document, field);
                if (fieldValue == null)
                    continue;
                const tokens = tokenize(stringifyField(fieldValue, field), field);
                const fieldId = this._fieldIds[field];
                const uniqueTerms = new Set(tokens).size;
                this.addFieldLength(shortDocumentId, fieldId, this._documentCount - 1, uniqueTerms);
                for (const term of tokens) {
                    const processedTerm = processTerm(term, field);
                    if (Array.isArray(processedTerm)) {
                        for (const t of processedTerm) {
                            this.addTerm(fieldId, shortDocumentId, t);
                        }
                    }
                    else if (processedTerm) {
                        this.addTerm(fieldId, shortDocumentId, processedTerm);
                    }
                }
            }
        }
        /**
         * Adds all the given documents to the index
         *
         * @param documents  An array of documents to be indexed
         */
        addAll(documents) {
            for (const document of documents)
                this.add(document);
        }
        /**
         * Adds all the given documents to the index asynchronously.
         *
         * Returns a promise that resolves (to `undefined`) when the indexing is done.
         * This method is useful when index many documents, to avoid blocking the main
         * thread. The indexing is performed asynchronously and in chunks.
         *
         * @param documents  An array of documents to be indexed
         * @param options  Configuration options
         * @return A promise resolving to `undefined` when the indexing is done
         */
        addAllAsync(documents, options = {}) {
            const { chunkSize = 10 } = options;
            const acc = { chunk: [], promise: Promise.resolve() };
            const { chunk, promise } = documents.reduce(({ chunk, promise }, document, i) => {
                chunk.push(document);
                if ((i + 1) % chunkSize === 0) {
                    return {
                        chunk: [],
                        promise: promise
                            .then(() => new Promise(resolve => setTimeout(resolve, 0)))
                            .then(() => this.addAll(chunk))
                    };
                }
                else {
                    return { chunk, promise };
                }
            }, acc);
            return promise.then(() => this.addAll(chunk));
        }
        /**
         * Removes the given document from the index.
         *
         * The document to remove must NOT have changed between indexing and removal,
         * otherwise the index will be corrupted.
         *
         * This method requires passing the full document to be removed (not just the
         * ID), and immediately removes the document from the inverted index, allowing
         * memory to be released. A convenient alternative is {@link
         * MiniSearch#discard}, which needs only the document ID, and has the same
         * visible effect, but delays cleaning up the index until the next vacuuming.
         *
         * @param document  The document to be removed
         */
        remove(document) {
            const { tokenize, processTerm, extractField, stringifyField, fields, idField } = this._options;
            const id = extractField(document, idField);
            if (id == null) {
                throw new Error(`MiniSearch: document does not have ID field "${idField}"`);
            }
            const shortId = this._idToShortId.get(id);
            if (shortId == null) {
                throw new Error(`MiniSearch: cannot remove document with ID ${id}: it is not in the index`);
            }
            for (const field of fields) {
                const fieldValue = extractField(document, field);
                if (fieldValue == null)
                    continue;
                const tokens = tokenize(stringifyField(fieldValue, field), field);
                const fieldId = this._fieldIds[field];
                const uniqueTerms = new Set(tokens).size;
                this.removeFieldLength(shortId, fieldId, this._documentCount, uniqueTerms);
                for (const term of tokens) {
                    const processedTerm = processTerm(term, field);
                    if (Array.isArray(processedTerm)) {
                        for (const t of processedTerm) {
                            this.removeTerm(fieldId, shortId, t);
                        }
                    }
                    else if (processedTerm) {
                        this.removeTerm(fieldId, shortId, processedTerm);
                    }
                }
            }
            this._storedFields.delete(shortId);
            this._documentIds.delete(shortId);
            this._idToShortId.delete(id);
            this._fieldLength.delete(shortId);
            this._documentCount -= 1;
        }
        /**
         * Removes all the given documents from the index. If called with no arguments,
         * it removes _all_ documents from the index.
         *
         * @param documents  The documents to be removed. If this argument is omitted,
         * all documents are removed. Note that, for removing all documents, it is
         * more efficient to call this method with no arguments than to pass all
         * documents.
         */
        removeAll(documents) {
            if (documents) {
                for (const document of documents)
                    this.remove(document);
            }
            else if (arguments.length > 0) {
                throw new Error('Expected documents to be present. Omit the argument to remove all documents.');
            }
            else {
                this._index = new SearchableMap();
                this._documentCount = 0;
                this._documentIds = new Map();
                this._idToShortId = new Map();
                this._fieldLength = new Map();
                this._avgFieldLength = [];
                this._storedFields = new Map();
                this._nextId = 0;
            }
        }
        /**
         * Discards the document with the given ID, so it won't appear in search results
         *
         * It has the same visible effect of {@link MiniSearch.remove} (both cause the
         * document to stop appearing in searches), but a different effect on the
         * internal data structures:
         *
         *   - {@link MiniSearch#remove} requires passing the full document to be
         *   removed as argument, and removes it from the inverted index immediately.
         *
         *   - {@link MiniSearch#discard} instead only needs the document ID, and
         *   works by marking the current version of the document as discarded, so it
         *   is immediately ignored by searches. This is faster and more convenient
         *   than {@link MiniSearch#remove}, but the index is not immediately
         *   modified. To take care of that, vacuuming is performed after a certain
         *   number of documents are discarded, cleaning up the index and allowing
         *   memory to be released.
         *
         * After discarding a document, it is possible to re-add a new version, and
         * only the new version will appear in searches. In other words, discarding
         * and re-adding a document works exactly like removing and re-adding it. The
         * {@link MiniSearch.replace} method can also be used to replace a document
         * with a new version.
         *
         * #### Details about vacuuming
         *
         * Repetite calls to this method would leave obsolete document references in
         * the index, invisible to searches. Two mechanisms take care of cleaning up:
         * clean up during search, and vacuuming.
         *
         *   - Upon search, whenever a discarded ID is found (and ignored for the
         *   results), references to the discarded document are removed from the
         *   inverted index entries for the search terms. This ensures that subsequent
         *   searches for the same terms do not need to skip these obsolete references
         *   again.
         *
         *   - In addition, vacuuming is performed automatically by default (see the
         *   `autoVacuum` field in {@link Options}) after a certain number of
         *   documents are discarded. Vacuuming traverses all terms in the index,
         *   cleaning up all references to discarded documents. Vacuuming can also be
         *   triggered manually by calling {@link MiniSearch#vacuum}.
         *
         * @param id  The ID of the document to be discarded
         */
        discard(id) {
            const shortId = this._idToShortId.get(id);
            if (shortId == null) {
                throw new Error(`MiniSearch: cannot discard document with ID ${id}: it is not in the index`);
            }
            this._idToShortId.delete(id);
            this._documentIds.delete(shortId);
            this._storedFields.delete(shortId);
            (this._fieldLength.get(shortId) || []).forEach((fieldLength, fieldId) => {
                this.removeFieldLength(shortId, fieldId, this._documentCount, fieldLength);
            });
            this._fieldLength.delete(shortId);
            this._documentCount -= 1;
            this._dirtCount += 1;
            this.maybeAutoVacuum();
        }
        maybeAutoVacuum() {
            if (this._options.autoVacuum === false) {
                return;
            }
            const { minDirtFactor, minDirtCount, batchSize, batchWait } = this._options.autoVacuum;
            this.conditionalVacuum({ batchSize, batchWait }, { minDirtCount, minDirtFactor });
        }
        /**
         * Discards the documents with the given IDs, so they won't appear in search
         * results
         *
         * It is equivalent to calling {@link MiniSearch#discard} for all the given
         * IDs, but with the optimization of triggering at most one automatic
         * vacuuming at the end.
         *
         * Note: to remove all documents from the index, it is faster and more
         * convenient to call {@link MiniSearch.removeAll} with no argument, instead
         * of passing all IDs to this method.
         */
        discardAll(ids) {
            const autoVacuum = this._options.autoVacuum;
            try {
                this._options.autoVacuum = false;
                for (const id of ids) {
                    this.discard(id);
                }
            }
            finally {
                this._options.autoVacuum = autoVacuum;
            }
            this.maybeAutoVacuum();
        }
        /**
         * It replaces an existing document with the given updated version
         *
         * It works by discarding the current version and adding the updated one, so
         * it is functionally equivalent to calling {@link MiniSearch#discard}
         * followed by {@link MiniSearch#add}. The ID of the updated document should
         * be the same as the original one.
         *
         * Since it uses {@link MiniSearch#discard} internally, this method relies on
         * vacuuming to clean up obsolete document references from the index, allowing
         * memory to be released (see {@link MiniSearch#discard}).
         *
         * @param updatedDocument  The updated document to replace the old version
         * with
         */
        replace(updatedDocument) {
            const { idField, extractField } = this._options;
            const id = extractField(updatedDocument, idField);
            this.discard(id);
            this.add(updatedDocument);
        }
        /**
         * Triggers a manual vacuuming, cleaning up references to discarded documents
         * from the inverted index
         *
         * Vacuuming is only useful for applications that use the {@link
         * MiniSearch#discard} or {@link MiniSearch#replace} methods.
         *
         * By default, vacuuming is performed automatically when needed (controlled by
         * the `autoVacuum` field in {@link Options}), so there is usually no need to
         * call this method, unless one wants to make sure to perform vacuuming at a
         * specific moment.
         *
         * Vacuuming traverses all terms in the inverted index in batches, and cleans
         * up references to discarded documents from the posting list, allowing memory
         * to be released.
         *
         * The method takes an optional object as argument with the following keys:
         *
         *   - `batchSize`: the size of each batch (1000 by default)
         *
         *   - `batchWait`: the number of milliseconds to wait between batches (10 by
         *   default)
         *
         * On large indexes, vacuuming could have a non-negligible cost: batching
         * avoids blocking the thread for long, diluting this cost so that it is not
         * negatively affecting the application. Nonetheless, this method should only
         * be called when necessary, and relying on automatic vacuuming is usually
         * better.
         *
         * It returns a promise that resolves (to undefined) when the clean up is
         * completed. If vacuuming is already ongoing at the time this method is
         * called, a new one is enqueued immediately after the ongoing one, and a
         * corresponding promise is returned. However, no more than one vacuuming is
         * enqueued on top of the ongoing one, even if this method is called more
         * times (enqueuing multiple ones would be useless).
         *
         * @param options  Configuration options for the batch size and delay. See
         * {@link VacuumOptions}.
         */
        vacuum(options = {}) {
            return this.conditionalVacuum(options);
        }
        conditionalVacuum(options, conditions) {
            // If a vacuum is already ongoing, schedule another as soon as it finishes,
            // unless there's already one enqueued. If one was already enqueued, do not
            // enqueue another on top, but make sure that the conditions are the
            // broadest.
            if (this._currentVacuum) {
                this._enqueuedVacuumConditions = this._enqueuedVacuumConditions && conditions;
                if (this._enqueuedVacuum != null) {
                    return this._enqueuedVacuum;
                }
                this._enqueuedVacuum = this._currentVacuum.then(() => {
                    const conditions = this._enqueuedVacuumConditions;
                    this._enqueuedVacuumConditions = defaultVacuumConditions;
                    return this.performVacuuming(options, conditions);
                });
                return this._enqueuedVacuum;
            }
            if (this.vacuumConditionsMet(conditions) === false) {
                return Promise.resolve();
            }
            this._currentVacuum = this.performVacuuming(options);
            return this._currentVacuum;
        }
        async performVacuuming(options, conditions) {
            const initialDirtCount = this._dirtCount;
            if (this.vacuumConditionsMet(conditions)) {
                const batchSize = options.batchSize || defaultVacuumOptions.batchSize;
                const batchWait = options.batchWait || defaultVacuumOptions.batchWait;
                let i = 1;
                for (const [term, fieldsData] of this._index) {
                    for (const [fieldId, fieldIndex] of fieldsData) {
                        for (const [shortId] of fieldIndex) {
                            if (this._documentIds.has(shortId)) {
                                continue;
                            }
                            if (fieldIndex.size <= 1) {
                                fieldsData.delete(fieldId);
                            }
                            else {
                                fieldIndex.delete(shortId);
                            }
                        }
                    }
                    if (this._index.get(term).size === 0) {
                        this._index.delete(term);
                    }
                    if (i % batchSize === 0) {
                        await new Promise((resolve) => setTimeout(resolve, batchWait));
                    }
                    i += 1;
                }
                this._dirtCount -= initialDirtCount;
            }
            // Make the next lines always async, so they execute after this function returns
            await null;
            this._currentVacuum = this._enqueuedVacuum;
            this._enqueuedVacuum = null;
        }
        vacuumConditionsMet(conditions) {
            if (conditions == null) {
                return true;
            }
            let { minDirtCount, minDirtFactor } = conditions;
            minDirtCount = minDirtCount || defaultAutoVacuumOptions.minDirtCount;
            minDirtFactor = minDirtFactor || defaultAutoVacuumOptions.minDirtFactor;
            return this.dirtCount >= minDirtCount && this.dirtFactor >= minDirtFactor;
        }
        /**
         * Is `true` if a vacuuming operation is ongoing, `false` otherwise
         */
        get isVacuuming() {
            return this._currentVacuum != null;
        }
        /**
         * The number of documents discarded since the most recent vacuuming
         */
        get dirtCount() {
            return this._dirtCount;
        }
        /**
         * A number between 0 and 1 giving an indication about the proportion of
         * documents that are discarded, and can therefore be cleaned up by vacuuming.
         * A value close to 0 means that the index is relatively clean, while a higher
         * value means that the index is relatively dirty, and vacuuming could release
         * memory.
         */
        get dirtFactor() {
            return this._dirtCount / (1 + this._documentCount + this._dirtCount);
        }
        /**
         * Returns `true` if a document with the given ID is present in the index and
         * available for search, `false` otherwise
         *
         * @param id  The document ID
         */
        has(id) {
            return this._idToShortId.has(id);
        }
        /**
         * Returns the stored fields (as configured in the `storeFields` constructor
         * option) for the given document ID. Returns `undefined` if the document is
         * not present in the index.
         *
         * @param id  The document ID
         */
        getStoredFields(id) {
            const shortId = this._idToShortId.get(id);
            if (shortId == null) {
                return undefined;
            }
            return this._storedFields.get(shortId);
        }
        /**
         * Search for documents matching the given search query.
         *
         * The result is a list of scored document IDs matching the query, sorted by
         * descending score, and each including data about which terms were matched and
         * in which fields.
         *
         * ### Basic usage:
         *
         * ```javascript
         * // Search for "zen art motorcycle" with default options: terms have to match
         * // exactly, and individual terms are joined with OR
         * miniSearch.search('zen art motorcycle')
         * // => [ { id: 2, score: 2.77258, match: { ... } }, { id: 4, score: 1.38629, match: { ... } } ]
         * ```
         *
         * ### Restrict search to specific fields:
         *
         * ```javascript
         * // Search only in the 'title' field
         * miniSearch.search('zen', { fields: ['title'] })
         * ```
         *
         * ### Field boosting:
         *
         * ```javascript
         * // Boost a field
         * miniSearch.search('zen', { boost: { title: 2 } })
         * ```
         *
         * ### Prefix search:
         *
         * ```javascript
         * // Search for "moto" with prefix search (it will match documents
         * // containing terms that start with "moto" or "neuro")
         * miniSearch.search('moto neuro', { prefix: true })
         * ```
         *
         * ### Fuzzy search:
         *
         * ```javascript
         * // Search for "ismael" with fuzzy search (it will match documents containing
         * // terms similar to "ismael", with a maximum edit distance of 0.2 term.length
         * // (rounded to nearest integer)
         * miniSearch.search('ismael', { fuzzy: 0.2 })
         * ```
         *
         * ### Combining strategies:
         *
         * ```javascript
         * // Mix of exact match, prefix search, and fuzzy search
         * miniSearch.search('ismael mob', {
         *  prefix: true,
         *  fuzzy: 0.2
         * })
         * ```
         *
         * ### Advanced prefix and fuzzy search:
         *
         * ```javascript
         * // Perform fuzzy and prefix search depending on the search term. Here
         * // performing prefix and fuzzy search only on terms longer than 3 characters
         * miniSearch.search('ismael mob', {
         *  prefix: term => term.length > 3
         *  fuzzy: term => term.length > 3 ? 0.2 : null
         * })
         * ```
         *
         * ### Combine with AND:
         *
         * ```javascript
         * // Combine search terms with AND (to match only documents that contain both
         * // "motorcycle" and "art")
         * miniSearch.search('motorcycle art', { combineWith: 'AND' })
         * ```
         *
         * ### Combine with AND_NOT:
         *
         * There is also an AND_NOT combinator, that finds documents that match the
         * first term, but do not match any of the other terms. This combinator is
         * rarely useful with simple queries, and is meant to be used with advanced
         * query combinations (see later for more details).
         *
         * ### Filtering results:
         *
         * ```javascript
         * // Filter only results in the 'fiction' category (assuming that 'category'
         * // is a stored field)
         * miniSearch.search('motorcycle art', {
         *   filter: (result) => result.category === 'fiction'
         * })
         * ```
         *
         * ### Wildcard query
         *
         * Searching for an empty string (assuming the default tokenizer) returns no
         * results. Sometimes though, one needs to match all documents, like in a
         * "wildcard" search. This is possible by passing the special value
         * {@link MiniSearch.wildcard} as the query:
         *
         * ```javascript
         * // Return search results for all documents
         * miniSearch.search(MiniSearch.wildcard)
         * ```
         *
         * Note that search options such as `filter` and `boostDocument` are still
         * applied, influencing which results are returned, and their order:
         *
         * ```javascript
         * // Return search results for all documents in the 'fiction' category
         * miniSearch.search(MiniSearch.wildcard, {
         *   filter: (result) => result.category === 'fiction'
         * })
         * ```
         *
         * ### Advanced combination of queries:
         *
         * It is possible to combine different subqueries with OR, AND, and AND_NOT,
         * and even with different search options, by passing a query expression
         * tree object as the first argument, instead of a string.
         *
         * ```javascript
         * // Search for documents that contain "zen" and ("motorcycle" or "archery")
         * miniSearch.search({
         *   combineWith: 'AND',
         *   queries: [
         *     'zen',
         *     {
         *       combineWith: 'OR',
         *       queries: ['motorcycle', 'archery']
         *     }
         *   ]
         * })
         *
         * // Search for documents that contain ("apple" or "pear") but not "juice" and
         * // not "tree"
         * miniSearch.search({
         *   combineWith: 'AND_NOT',
         *   queries: [
         *     {
         *       combineWith: 'OR',
         *       queries: ['apple', 'pear']
         *     },
         *     'juice',
         *     'tree'
         *   ]
         * })
         * ```
         *
         * Each node in the expression tree can be either a string, or an object that
         * supports all {@link SearchOptions} fields, plus a `queries` array field for
         * subqueries.
         *
         * Note that, while this can become complicated to do by hand for complex or
         * deeply nested queries, it provides a formalized expression tree API for
         * external libraries that implement a parser for custom query languages.
         *
         * @param query  Search query
         * @param searchOptions  Search options. Each option, if not given, defaults to the corresponding value of `searchOptions` given to the constructor, or to the library default.
         */
        search(query, searchOptions = {}) {
            const { searchOptions: globalSearchOptions } = this._options;
            const searchOptionsWithDefaults = { ...globalSearchOptions, ...searchOptions };
            const rawResults = this.executeQuery(query, searchOptions);
            const results = [];
            for (const [docId, { score, terms, match }] of rawResults) {
                // terms are the matched query terms, which will be returned to the user
                // as queryTerms. The quality is calculated based on them, as opposed to
                // the matched terms in the document (which can be different due to
                // prefix and fuzzy match)
                const quality = terms.length || 1;
                const result = {
                    id: this._documentIds.get(docId),
                    score: score * quality,
                    terms: Object.keys(match),
                    queryTerms: terms,
                    match
                };
                Object.assign(result, this._storedFields.get(docId));
                if (searchOptionsWithDefaults.filter == null || searchOptionsWithDefaults.filter(result)) {
                    results.push(result);
                }
            }
            // If it's a wildcard query, and no document boost is applied, skip sorting
            // the results, as all results have the same score of 1
            if (query === MiniSearch.wildcard && searchOptionsWithDefaults.boostDocument == null) {
                return results;
            }
            results.sort(byScore);
            return results;
        }
        /**
         * Provide suggestions for the given search query
         *
         * The result is a list of suggested modified search queries, derived from the
         * given search query, each with a relevance score, sorted by descending score.
         *
         * By default, it uses the same options used for search, except that by
         * default it performs prefix search on the last term of the query, and
         * combine terms with `'AND'` (requiring all query terms to match). Custom
         * options can be passed as a second argument. Defaults can be changed upon
         * calling the {@link MiniSearch} constructor, by passing a
         * `autoSuggestOptions` option.
         *
         * ### Basic usage:
         *
         * ```javascript
         * // Get suggestions for 'neuro':
         * miniSearch.autoSuggest('neuro')
         * // => [ { suggestion: 'neuromancer', terms: [ 'neuromancer' ], score: 0.46240 } ]
         * ```
         *
         * ### Multiple words:
         *
         * ```javascript
         * // Get suggestions for 'zen ar':
         * miniSearch.autoSuggest('zen ar')
         * // => [
         * //  { suggestion: 'zen archery art', terms: [ 'zen', 'archery', 'art' ], score: 1.73332 },
         * //  { suggestion: 'zen art', terms: [ 'zen', 'art' ], score: 1.21313 }
         * // ]
         * ```
         *
         * ### Fuzzy suggestions:
         *
         * ```javascript
         * // Correct spelling mistakes using fuzzy search:
         * miniSearch.autoSuggest('neromancer', { fuzzy: 0.2 })
         * // => [ { suggestion: 'neuromancer', terms: [ 'neuromancer' ], score: 1.03998 } ]
         * ```
         *
         * ### Filtering:
         *
         * ```javascript
         * // Get suggestions for 'zen ar', but only within the 'fiction' category
         * // (assuming that 'category' is a stored field):
         * miniSearch.autoSuggest('zen ar', {
         *   filter: (result) => result.category === 'fiction'
         * })
         * // => [
         * //  { suggestion: 'zen archery art', terms: [ 'zen', 'archery', 'art' ], score: 1.73332 },
         * //  { suggestion: 'zen art', terms: [ 'zen', 'art' ], score: 1.21313 }
         * // ]
         * ```
         *
         * @param queryString  Query string to be expanded into suggestions
         * @param options  Search options. The supported options and default values
         * are the same as for the {@link MiniSearch#search} method, except that by
         * default prefix search is performed on the last term in the query, and terms
         * are combined with `'AND'`.
         * @return  A sorted array of suggestions sorted by relevance score.
         */
        autoSuggest(queryString, options = {}) {
            options = { ...this._options.autoSuggestOptions, ...options };
            const suggestions = new Map();
            for (const { score, terms } of this.search(queryString, options)) {
                const phrase = terms.join(' ');
                const suggestion = suggestions.get(phrase);
                if (suggestion != null) {
                    suggestion.score += score;
                    suggestion.count += 1;
                }
                else {
                    suggestions.set(phrase, { score, terms, count: 1 });
                }
            }
            const results = [];
            for (const [suggestion, { score, terms, count }] of suggestions) {
                results.push({ suggestion, terms, score: score / count });
            }
            results.sort(byScore);
            return results;
        }
        /**
         * Total number of documents available to search
         */
        get documentCount() {
            return this._documentCount;
        }
        /**
         * Number of terms in the index
         */
        get termCount() {
            return this._index.size;
        }
        /**
         * Deserializes a JSON index (serialized with `JSON.stringify(miniSearch)`)
         * and instantiates a MiniSearch instance. It should be given the same options
         * originally used when serializing the index.
         *
         * ### Usage:
         *
         * ```javascript
         * // If the index was serialized with:
         * let miniSearch = new MiniSearch({ fields: ['title', 'text'] })
         * miniSearch.addAll(documents)
         *
         * const json = JSON.stringify(miniSearch)
         * // It can later be deserialized like this:
         * miniSearch = MiniSearch.loadJSON(json, { fields: ['title', 'text'] })
         * ```
         *
         * @param json  JSON-serialized index
         * @param options  configuration options, same as the constructor
         * @return An instance of MiniSearch deserialized from the given JSON.
         */
        static loadJSON(json, options) {
            if (options == null) {
                throw new Error('MiniSearch: loadJSON should be given the same options used when serializing the index');
            }
            return this.loadJS(JSON.parse(json), options);
        }
        /**
         * Async equivalent of {@link MiniSearch.loadJSON}
         *
         * This function is an alternative to {@link MiniSearch.loadJSON} that returns
         * a promise, and loads the index in batches, leaving pauses between them to avoid
         * blocking the main thread. It tends to be slower than the synchronous
         * version, but does not block the main thread, so it can be a better choice
         * when deserializing very large indexes.
         *
         * @param json  JSON-serialized index
         * @param options  configuration options, same as the constructor
         * @return A Promise that will resolve to an instance of MiniSearch deserialized from the given JSON.
         */
        static async loadJSONAsync(json, options) {
            if (options == null) {
                throw new Error('MiniSearch: loadJSON should be given the same options used when serializing the index');
            }
            return this.loadJSAsync(JSON.parse(json), options);
        }
        /**
         * Returns the default value of an option. It will throw an error if no option
         * with the given name exists.
         *
         * @param optionName  Name of the option
         * @return The default value of the given option
         *
         * ### Usage:
         *
         * ```javascript
         * // Get default tokenizer
         * MiniSearch.getDefault('tokenize')
         *
         * // Get default term processor
         * MiniSearch.getDefault('processTerm')
         *
         * // Unknown options will throw an error
         * MiniSearch.getDefault('notExisting')
         * // => throws 'MiniSearch: unknown option "notExisting"'
         * ```
         */
        static getDefault(optionName) {
            if (defaultOptions.hasOwnProperty(optionName)) {
                return getOwnProperty(defaultOptions, optionName);
            }
            else {
                throw new Error(`MiniSearch: unknown option "${optionName}"`);
            }
        }
        /**
         * @ignore
         */
        static loadJS(js, options) {
            const { index, documentIds, fieldLength, storedFields, serializationVersion } = js;
            const miniSearch = this.instantiateMiniSearch(js, options);
            miniSearch._documentIds = objectToNumericMap(documentIds);
            miniSearch._fieldLength = objectToNumericMap(fieldLength);
            miniSearch._storedFields = objectToNumericMap(storedFields);
            for (const [shortId, id] of miniSearch._documentIds) {
                miniSearch._idToShortId.set(id, shortId);
            }
            for (const [term, data] of index) {
                const dataMap = new Map();
                for (const fieldId of Object.keys(data)) {
                    let indexEntry = data[fieldId];
                    // Version 1 used to nest the index entry inside a field called ds
                    if (serializationVersion === 1) {
                        indexEntry = indexEntry.ds;
                    }
                    dataMap.set(parseInt(fieldId, 10), objectToNumericMap(indexEntry));
                }
                miniSearch._index.set(term, dataMap);
            }
            return miniSearch;
        }
        /**
         * @ignore
         */
        static async loadJSAsync(js, options) {
            const { index, documentIds, fieldLength, storedFields, serializationVersion } = js;
            const miniSearch = this.instantiateMiniSearch(js, options);
            miniSearch._documentIds = await objectToNumericMapAsync(documentIds);
            miniSearch._fieldLength = await objectToNumericMapAsync(fieldLength);
            miniSearch._storedFields = await objectToNumericMapAsync(storedFields);
            for (const [shortId, id] of miniSearch._documentIds) {
                miniSearch._idToShortId.set(id, shortId);
            }
            let count = 0;
            for (const [term, data] of index) {
                const dataMap = new Map();
                for (const fieldId of Object.keys(data)) {
                    let indexEntry = data[fieldId];
                    // Version 1 used to nest the index entry inside a field called ds
                    if (serializationVersion === 1) {
                        indexEntry = indexEntry.ds;
                    }
                    dataMap.set(parseInt(fieldId, 10), await objectToNumericMapAsync(indexEntry));
                }
                if (++count % 1000 === 0)
                    await wait(0);
                miniSearch._index.set(term, dataMap);
            }
            return miniSearch;
        }
        /**
         * @ignore
         */
        static instantiateMiniSearch(js, options) {
            const { documentCount, nextId, fieldIds, averageFieldLength, dirtCount, serializationVersion } = js;
            if (serializationVersion !== 1 && serializationVersion !== 2) {
                throw new Error('MiniSearch: cannot deserialize an index created with an incompatible version');
            }
            const miniSearch = new MiniSearch(options);
            miniSearch._documentCount = documentCount;
            miniSearch._nextId = nextId;
            miniSearch._idToShortId = new Map();
            miniSearch._fieldIds = fieldIds;
            miniSearch._avgFieldLength = averageFieldLength;
            miniSearch._dirtCount = dirtCount || 0;
            miniSearch._index = new SearchableMap();
            return miniSearch;
        }
        /**
         * @ignore
         */
        executeQuery(query, searchOptions = {}) {
            if (query === MiniSearch.wildcard) {
                return this.executeWildcardQuery(searchOptions);
            }
            if (typeof query !== 'string') {
                const options = { ...searchOptions, ...query, queries: undefined };
                const results = query.queries.map((subquery) => this.executeQuery(subquery, options));
                return this.combineResults(results, options.combineWith);
            }
            const { tokenize, processTerm, searchOptions: globalSearchOptions } = this._options;
            const options = { tokenize, processTerm, ...globalSearchOptions, ...searchOptions };
            const { tokenize: searchTokenize, processTerm: searchProcessTerm } = options;
            const terms = searchTokenize(query)
                .flatMap((term) => searchProcessTerm(term))
                .filter((term) => !!term);
            const queries = terms.map(termToQuerySpec(options));
            const results = queries.map(query => this.executeQuerySpec(query, options));
            return this.combineResults(results, options.combineWith);
        }
        /**
         * @ignore
         */
        executeQuerySpec(query, searchOptions) {
            const options = { ...this._options.searchOptions, ...searchOptions };
            const boosts = (options.fields || this._options.fields).reduce((boosts, field) => ({ ...boosts, [field]: getOwnProperty(options.boost, field) || 1 }), {});
            const { boostDocument, weights, maxFuzzy, bm25: bm25params } = options;
            const { fuzzy: fuzzyWeight, prefix: prefixWeight } = { ...defaultSearchOptions.weights, ...weights };
            const data = this._index.get(query.term);
            const results = this.termResults(query.term, query.term, 1, query.termBoost, data, boosts, boostDocument, bm25params);
            let prefixMatches;
            let fuzzyMatches;
            if (query.prefix) {
                prefixMatches = this._index.atPrefix(query.term);
            }
            if (query.fuzzy) {
                const fuzzy = (query.fuzzy === true) ? 0.2 : query.fuzzy;
                const maxDistance = fuzzy < 1 ? Math.min(maxFuzzy, Math.round(query.term.length * fuzzy)) : fuzzy;
                if (maxDistance)
                    fuzzyMatches = this._index.fuzzyGet(query.term, maxDistance);
            }
            if (prefixMatches) {
                for (const [term, data] of prefixMatches) {
                    const distance = term.length - query.term.length;
                    if (!distance) {
                        continue;
                    } // Skip exact match.
                    // Delete the term from fuzzy results (if present) if it is also a
                    // prefix result. This entry will always be scored as a prefix result.
                    fuzzyMatches === null || fuzzyMatches === void 0 ? void 0 : fuzzyMatches.delete(term);
                    // Weight gradually approaches 0 as distance goes to infinity, with the
                    // weight for the hypothetical distance 0 being equal to prefixWeight.
                    // The rate of change is much lower than that of fuzzy matches to
                    // account for the fact that prefix matches stay more relevant than
                    // fuzzy matches for longer distances.
                    const weight = prefixWeight * term.length / (term.length + 0.3 * distance);
                    this.termResults(query.term, term, weight, query.termBoost, data, boosts, boostDocument, bm25params, results);
                }
            }
            if (fuzzyMatches) {
                for (const term of fuzzyMatches.keys()) {
                    const [data, distance] = fuzzyMatches.get(term);
                    if (!distance) {
                        continue;
                    } // Skip exact match.
                    // Weight gradually approaches 0 as distance goes to infinity, with the
                    // weight for the hypothetical distance 0 being equal to fuzzyWeight.
                    const weight = fuzzyWeight * term.length / (term.length + distance);
                    this.termResults(query.term, term, weight, query.termBoost, data, boosts, boostDocument, bm25params, results);
                }
            }
            return results;
        }
        /**
         * @ignore
         */
        executeWildcardQuery(searchOptions) {
            const results = new Map();
            const options = { ...this._options.searchOptions, ...searchOptions };
            for (const [shortId, id] of this._documentIds) {
                const score = options.boostDocument ? options.boostDocument(id, '', this._storedFields.get(shortId)) : 1;
                results.set(shortId, {
                    score,
                    terms: [],
                    match: {}
                });
            }
            return results;
        }
        /**
         * @ignore
         */
        combineResults(results, combineWith = OR) {
            if (results.length === 0) {
                return new Map();
            }
            const operator = combineWith.toLowerCase();
            const combinator = combinators[operator];
            if (!combinator) {
                throw new Error(`Invalid combination operator: ${combineWith}`);
            }
            return results.reduce(combinator) || new Map();
        }
        /**
         * Allows serialization of the index to JSON, to possibly store it and later
         * deserialize it with {@link MiniSearch.loadJSON}.
         *
         * Normally one does not directly call this method, but rather call the
         * standard JavaScript `JSON.stringify()` passing the {@link MiniSearch}
         * instance, and JavaScript will internally call this method. Upon
         * deserialization, one must pass to {@link MiniSearch.loadJSON} the same
         * options used to create the original instance that was serialized.
         *
         * ### Usage:
         *
         * ```javascript
         * // Serialize the index:
         * let miniSearch = new MiniSearch({ fields: ['title', 'text'] })
         * miniSearch.addAll(documents)
         * const json = JSON.stringify(miniSearch)
         *
         * // Later, to deserialize it:
         * miniSearch = MiniSearch.loadJSON(json, { fields: ['title', 'text'] })
         * ```
         *
         * @return A plain-object serializable representation of the search index.
         */
        toJSON() {
            const index = [];
            for (const [term, fieldIndex] of this._index) {
                const data = {};
                for (const [fieldId, freqs] of fieldIndex) {
                    data[fieldId] = Object.fromEntries(freqs);
                }
                index.push([term, data]);
            }
            return {
                documentCount: this._documentCount,
                nextId: this._nextId,
                documentIds: Object.fromEntries(this._documentIds),
                fieldIds: this._fieldIds,
                fieldLength: Object.fromEntries(this._fieldLength),
                averageFieldLength: this._avgFieldLength,
                storedFields: Object.fromEntries(this._storedFields),
                dirtCount: this._dirtCount,
                index,
                serializationVersion: 2
            };
        }
        /**
         * @ignore
         */
        termResults(sourceTerm, derivedTerm, termWeight, termBoost, fieldTermData, fieldBoosts, boostDocumentFn, bm25params, results = new Map()) {
            if (fieldTermData == null)
                return results;
            for (const field of Object.keys(fieldBoosts)) {
                const fieldBoost = fieldBoosts[field];
                const fieldId = this._fieldIds[field];
                const fieldTermFreqs = fieldTermData.get(fieldId);
                if (fieldTermFreqs == null)
                    continue;
                let matchingFields = fieldTermFreqs.size;
                const avgFieldLength = this._avgFieldLength[fieldId];
                for (const docId of fieldTermFreqs.keys()) {
                    if (!this._documentIds.has(docId)) {
                        this.removeTerm(fieldId, docId, derivedTerm);
                        matchingFields -= 1;
                        continue;
                    }
                    const docBoost = boostDocumentFn ? boostDocumentFn(this._documentIds.get(docId), derivedTerm, this._storedFields.get(docId)) : 1;
                    if (!docBoost)
                        continue;
                    const termFreq = fieldTermFreqs.get(docId);
                    const fieldLength = this._fieldLength.get(docId)[fieldId];
                    // NOTE: The total number of fields is set to the number of documents
                    // `this._documentCount`. It could also make sense to use the number of
                    // documents where the current field is non-blank as a normalization
                    // factor. This will make a difference in scoring if the field is rarely
                    // present. This is currently not supported, and may require further
                    // analysis to see if it is a valid use case.
                    const rawScore = calcBM25Score(termFreq, matchingFields, this._documentCount, fieldLength, avgFieldLength, bm25params);
                    const weightedScore = termWeight * termBoost * fieldBoost * docBoost * rawScore;
                    const result = results.get(docId);
                    if (result) {
                        result.score += weightedScore;
                        assignUniqueTerm(result.terms, sourceTerm);
                        const match = getOwnProperty(result.match, derivedTerm);
                        if (match) {
                            match.push(field);
                        }
                        else {
                            result.match[derivedTerm] = [field];
                        }
                    }
                    else {
                        results.set(docId, {
                            score: weightedScore,
                            terms: [sourceTerm],
                            match: { [derivedTerm]: [field] }
                        });
                    }
                }
            }
            return results;
        }
        /**
         * @ignore
         */
        addTerm(fieldId, documentId, term) {
            const indexData = this._index.fetch(term, createMap);
            let fieldIndex = indexData.get(fieldId);
            if (fieldIndex == null) {
                fieldIndex = new Map();
                fieldIndex.set(documentId, 1);
                indexData.set(fieldId, fieldIndex);
            }
            else {
                const docs = fieldIndex.get(documentId);
                fieldIndex.set(documentId, (docs || 0) + 1);
            }
        }
        /**
         * @ignore
         */
        removeTerm(fieldId, documentId, term) {
            if (!this._index.has(term)) {
                this.warnDocumentChanged(documentId, fieldId, term);
                return;
            }
            const indexData = this._index.fetch(term, createMap);
            const fieldIndex = indexData.get(fieldId);
            if (fieldIndex == null || fieldIndex.get(documentId) == null) {
                this.warnDocumentChanged(documentId, fieldId, term);
            }
            else if (fieldIndex.get(documentId) <= 1) {
                if (fieldIndex.size <= 1) {
                    indexData.delete(fieldId);
                }
                else {
                    fieldIndex.delete(documentId);
                }
            }
            else {
                fieldIndex.set(documentId, fieldIndex.get(documentId) - 1);
            }
            if (this._index.get(term).size === 0) {
                this._index.delete(term);
            }
        }
        /**
         * @ignore
         */
        warnDocumentChanged(shortDocumentId, fieldId, term) {
            for (const fieldName of Object.keys(this._fieldIds)) {
                if (this._fieldIds[fieldName] === fieldId) {
                    this._options.logger('warn', `MiniSearch: document with ID ${this._documentIds.get(shortDocumentId)} has changed before removal: term "${term}" was not present in field "${fieldName}". Removing a document after it has changed can corrupt the index!`, 'version_conflict');
                    return;
                }
            }
        }
        /**
         * @ignore
         */
        addDocumentId(documentId) {
            const shortDocumentId = this._nextId;
            this._idToShortId.set(documentId, shortDocumentId);
            this._documentIds.set(shortDocumentId, documentId);
            this._documentCount += 1;
            this._nextId += 1;
            return shortDocumentId;
        }
        /**
         * @ignore
         */
        addFields(fields) {
            for (let i = 0; i < fields.length; i++) {
                this._fieldIds[fields[i]] = i;
            }
        }
        /**
         * @ignore
         */
        addFieldLength(documentId, fieldId, count, length) {
            let fieldLengths = this._fieldLength.get(documentId);
            if (fieldLengths == null)
                this._fieldLength.set(documentId, fieldLengths = []);
            fieldLengths[fieldId] = length;
            const averageFieldLength = this._avgFieldLength[fieldId] || 0;
            const totalFieldLength = (averageFieldLength * count) + length;
            this._avgFieldLength[fieldId] = totalFieldLength / (count + 1);
        }
        /**
         * @ignore
         */
        removeFieldLength(documentId, fieldId, count, length) {
            if (count === 1) {
                this._avgFieldLength[fieldId] = 0;
                return;
            }
            const totalFieldLength = (this._avgFieldLength[fieldId] * count) - length;
            this._avgFieldLength[fieldId] = totalFieldLength / (count - 1);
        }
        /**
         * @ignore
         */
        saveStoredFields(documentId, doc) {
            const { storeFields, extractField } = this._options;
            if (storeFields == null || storeFields.length === 0) {
                return;
            }
            let documentFields = this._storedFields.get(documentId);
            if (documentFields == null)
                this._storedFields.set(documentId, documentFields = {});
            for (const fieldName of storeFields) {
                const fieldValue = extractField(doc, fieldName);
                if (fieldValue !== undefined)
                    documentFields[fieldName] = fieldValue;
            }
        }
    }
    /**
     * The special wildcard symbol that can be passed to {@link MiniSearch#search}
     * to match all documents
     */
    MiniSearch.wildcard = Symbol('*');
    const getOwnProperty = (object, property) => Object.prototype.hasOwnProperty.call(object, property) ? object[property] : undefined;
    const combinators = {
        [OR]: (a, b) => {
            for (const docId of b.keys()) {
                const existing = a.get(docId);
                if (existing == null) {
                    a.set(docId, b.get(docId));
                }
                else {
                    const { score, terms, match } = b.get(docId);
                    existing.score = existing.score + score;
                    existing.match = Object.assign(existing.match, match);
                    assignUniqueTerms(existing.terms, terms);
                }
            }
            return a;
        },
        [AND]: (a, b) => {
            const combined = new Map();
            for (const docId of b.keys()) {
                const existing = a.get(docId);
                if (existing == null)
                    continue;
                const { score, terms, match } = b.get(docId);
                assignUniqueTerms(existing.terms, terms);
                combined.set(docId, {
                    score: existing.score + score,
                    terms: existing.terms,
                    match: Object.assign(existing.match, match)
                });
            }
            return combined;
        },
        [AND_NOT]: (a, b) => {
            for (const docId of b.keys())
                a.delete(docId);
            return a;
        }
    };
    const defaultBM25params = { k: 1.2, b: 0.7, d: 0.5 };
    const calcBM25Score = (termFreq, matchingCount, totalCount, fieldLength, avgFieldLength, bm25params) => {
        const { k, b, d } = bm25params;
        const invDocFreq = Math.log(1 + (totalCount - matchingCount + 0.5) / (matchingCount + 0.5));
        return invDocFreq * (d + termFreq * (k + 1) / (termFreq + k * (1 - b + b * fieldLength / avgFieldLength)));
    };
    const termToQuerySpec = (options) => (term, i, terms) => {
        const fuzzy = (typeof options.fuzzy === 'function')
            ? options.fuzzy(term, i, terms)
            : (options.fuzzy || false);
        const prefix = (typeof options.prefix === 'function')
            ? options.prefix(term, i, terms)
            : (options.prefix === true);
        const termBoost = (typeof options.boostTerm === 'function')
            ? options.boostTerm(term, i, terms)
            : 1;
        return { term, fuzzy, prefix, termBoost };
    };
    const defaultOptions = {
        idField: 'id',
        extractField: (document, fieldName) => document[fieldName],
        stringifyField: (fieldValue, fieldName) => fieldValue.toString(),
        tokenize: (text) => text.split(SPACE_OR_PUNCTUATION),
        processTerm: (term) => term.toLowerCase(),
        fields: undefined,
        searchOptions: undefined,
        storeFields: [],
        logger: (level, message) => {
            if (typeof (console === null || console === void 0 ? void 0 : console[level]) === 'function')
                console[level](message);
        },
        autoVacuum: true
    };
    const defaultSearchOptions = {
        combineWith: OR,
        prefix: false,
        fuzzy: false,
        maxFuzzy: 6,
        boost: {},
        weights: { fuzzy: 0.45, prefix: 0.375 },
        bm25: defaultBM25params
    };
    const defaultAutoSuggestOptions = {
        combineWith: AND,
        prefix: (term, i, terms) => i === terms.length - 1
    };
    const defaultVacuumOptions = { batchSize: 1000, batchWait: 10 };
    const defaultVacuumConditions = { minDirtFactor: 0.1, minDirtCount: 20 };
    const defaultAutoVacuumOptions = { ...defaultVacuumOptions, ...defaultVacuumConditions };
    const assignUniqueTerm = (target, term) => {
        // Avoid adding duplicate terms.
        if (!target.includes(term))
            target.push(term);
    };
    const assignUniqueTerms = (target, source) => {
        for (const term of source) {
            // Avoid adding duplicate terms.
            if (!target.includes(term))
                target.push(term);
        }
    };
    const byScore = ({ score: a }, { score: b }) => b - a;
    const createMap = () => new Map();
    const objectToNumericMap = (object) => {
        const map = new Map();
        for (const key of Object.keys(object)) {
            map.set(parseInt(key, 10), object[key]);
        }
        return map;
    };
    const objectToNumericMapAsync = async (object) => {
        const map = new Map();
        let count = 0;
        for (const key of Object.keys(object)) {
            map.set(parseInt(key, 10), object[key]);
            if (++count % 1000 === 0) {
                await wait(0);
            }
        }
        return map;
    };
    const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    // This regular expression matches any Unicode space, newline, or punctuation
    // character
    const SPACE_OR_PUNCTUATION = /[\n\r\p{Z}\p{P}]+/u;

    /**
     * Simple EventEmitter mixin; use our own implementation as a) most NPM modules don't provide an
     * ES6 export and b) they're not made to be used as mixins.
     * Export a function for all mixins, even if not needed here (consistency).
     */
    var canEmitEvents = () => {

        return {

            /**
             * Map that holds all callbacks for all types
             * @type Map.<*, function[]>
            */
            eventHandlers: new Map(),

            /**
             * Adds event handler for a given type
             * @param {*} type               Name of the event handler
             * @param {function} callback    Callback to call if corresponding event is emitted
            */
            on(type, callback) {
                if (!this.eventHandlers.has(type)) this.eventHandlers.set(type, [callback]);
                else this.eventHandlers.get(type).push(callback);
            },

            /**
             * Removes an event handler; if only type is given, all callbacks of the type will be
             * removed. If type and callback are given, only the specific callbacks for the given type
             * will be removed.
             * @param {*} type               Type of event handler to remove
             * @param {function} callback    Callback to remove
             */
            off(type, callback) {
                if (!this.eventHandlers.has(type)) return;
                if (!callback) this.eventHandlers.delete(type);
                else {
                    this.eventHandlers.set(
                        type,
                        this.eventHandlers.get(type).filter(cb => cb !== callback),
                    );
                }
            },

            /**
             * Calls all callbacks of the provided type with the given parameters.
             * @param {*} type          Type of eventHandler to call
             * @param {...*} params     Parameters to pass to callbacks
             */
            emit(type, ...params) {
                (this.eventHandlers.get(type) || []).forEach(handler => handler(...params));
            },
        };

    };

    /**
     * Core business logic for faceted search: holds state, runs combined queries
     * (itemsjs for filtering, MiniSearch for full-text search), computes expected
     * result counts per filter value. Pure class, no DOM.
     *
     * Integration follows the recommended pattern from itemsjs docs:
     * MiniSearch handles full-text search and returns matching IDs;
     * itemsjs receives those IDs via its `ids` parameter and handles
     * faceted filtering + aggregation on that subset.
     */

    class FacetedSearchModel {

        /** @type {{ [filterName: string]: string[] }} */
        #activeFilters = {};

        /** @type {string} */
        #searchTerm = '';

        /** @type {object} itemsjs instance for faceted filtering */
        #filterEngine;

        /** @type {MiniSearch} MiniSearch instance for full-text search */
        #searchEngine;

        /** @type {string[]} original item IDs in DOM order */
        #originalOrder;

        /** @type {boolean} */
        #orderByRelevance;

        /** @type {boolean} */
        #fuzzy;

        /** @type {object[]} raw items */
        #items;

        /** @type {string[]} filter field names used in itemsjs */
        #filterFieldNames;

        /** @type {object[]} search field configs with boost */
        #searchConfigs;

        /**
         * @param {object} options
         * @param {object[]} options.items - [{ id, filterFields: {}, searchFields: {} }]
         * @param {object[]} options.filterConfigs - [{ name }] — filter names to register
         * @param {object[]} options.searchConfigs - [{ field, boost }] — search fields with boost
         * @param {boolean} options.fuzzy - Enable fuzzy matching in MiniSearch
         * @param {boolean} options.orderByRelevance - Order by MiniSearch relevance when searching
         */
        constructor({ items, filterConfigs = [], searchConfigs = [], fuzzy = false, orderByRelevance = false }) {
            Object.assign(this, canEmitEvents());

            this.#items = items;
            this.#fuzzy = fuzzy;
            this.#orderByRelevance = orderByRelevance;
            this.#originalOrder = items.map((item) => item.id);
            this.#filterFieldNames = filterConfigs.map((config) => config.name);
            this.#searchConfigs = searchConfigs;

            this.#buildFilterEngine();
            this.#buildSearchEngine();
        }

        #buildFilterEngine() {
            const flatItems = this.#items.map((item) => ({
                id: item.id,
                ...item.filterFields,
            }));

            const aggregations = {};
            this.#filterFieldNames.forEach((name) => {
                // conjunction: false → OR logic within a single filter (spec requirement)
                aggregations[name] = { title: name, size: 10000, conjunction: false };
            });

            this.#filterEngine = Wn(flatItems, {
                native_search_enabled: false,
                custom_id_field: 'id',
                aggregations,
            });
        }

        #buildSearchEngine() {
            const searchFieldNames = this.#searchConfigs.map((config) => config.field);
            if (searchFieldNames.length === 0) {
                this.#searchEngine = null;
                return;
            }

            this.#searchEngine = new MiniSearch({
                fields: searchFieldNames,
                idField: 'id',
            });

            const searchDocs = this.#items.map((item) => ({
                id: item.id,
                ...item.searchFields,
            }));

            this.#searchEngine.addAll(searchDocs);
        }

        /**
         * Returns MiniSearch result IDs ordered by relevance, or null if no search is active.
         * @returns {string[]|null}
         */
        #getSearchedIds() {
            if (!this.#searchTerm || !this.#searchEngine) return null;

            const boostConfig = {};
            this.#searchConfigs.forEach((config) => {
                if (config.boost) boostConfig[config.field] = config.boost;
            });

            const options = {};
            if (this.#fuzzy) options.fuzzy = 0.2;
            if (Object.keys(boostConfig).length > 0) options.boost = boostConfig;

            const results = this.#searchEngine.search(this.#searchTerm, options);
            return results.map((result) => result.id);
        }

        /**
         * Builds a query object that itemsjs can execute. Merges the active (or
         * overridden) filter state with pre-computed MiniSearch IDs so that
         * itemsjs handles faceted filtering while MiniSearch handles full-text
         * search. The returned object is passed directly to itemsjs.search().
         * @param {string[]|null} searchedIds - Pre-computed MiniSearch result IDs, or null when no search is active
         * @param {{ [filterName: string]: string[] }} [filterOverrides] - Optional filter state override for hypothetical queries
         * @returns {object} itemsjs-compatible search query
         */
        #buildQuery(searchedIds, filterOverrides) {
            const activeFilters = filterOverrides || this.#activeFilters;
            const query = { per_page: 100000 };

            const filters = {};
            Object.entries(activeFilters).forEach(([name, values]) => {
                if (values.length > 0) filters[name] = values;
            });
            if (Object.keys(filters).length > 0) query.filters = filters;

            if (searchedIds !== null) query.ids = searchedIds;

            return query;
        }

        /**
         * Runs the combined query and returns ordered visible IDs.
         * @param {{ [filterName: string]: string[] }} [filterOverrides] - Optional filter state override
         * @returns {string[]}
         */
        #computeVisibleIds(filterOverrides) {
            const searchedIds = this.#getSearchedIds();
            const hasActiveFilters = Object.values(filterOverrides || this.#activeFilters)
                .some((values) => values.length > 0);

            // No search, no filters → all items in original order
            if (searchedIds === null && !hasActiveFilters) return this.#originalOrder;

            const query = this.#buildQuery(searchedIds, filterOverrides);
            const result = this.#filterEngine.search(query);
            const resultIds = result.data.items.map((item) => item.id);

            // When searching with relevance ordering, preserve MiniSearch's order
            if (searchedIds !== null && this.#orderByRelevance) {
                const resultSet = new Set(resultIds);
                return searchedIds.filter((id) => resultSet.has(id));
            }

            return resultIds;
        }

        /** @param {string} term */
        setSearchTerm(term) {
            this.#searchTerm = term;
            this.emit('change');
        }

        /**
         * Toggles a filter value on or off.
         * @param {string} name - Filter name
         * @param {string} value - Filter value
         * @param {boolean} selected - Whether the value is selected
         */
        setFilter(name, value, selected) {
            if (!this.#activeFilters[name]) this.#activeFilters[name] = [];
            if (selected) {
                if (!this.#activeFilters[name].includes(value)) {
                    this.#activeFilters[name].push(value);
                }
            } else {
                this.#activeFilters[name] = this.#activeFilters[name].filter((active) => active !== value);
            }
            this.emit('change');
        }

        /**
         * Returns visible item IDs after applying all active filters and search.
         * @returns {string[]}
         */
        getVisibleIds() {
            return this.#computeVisibleIds();
        }

        /**
         * Computes expected result counts for each value in a given filter.
         * For each value, temporarily adds it to the filter state and counts results.
         * @param {string} filterName
         * @param {Array<{ id: string, value: string }>} filterValues - All values of this filter
         * @returns {{ [valueId: string]: number }}
         */
        getExpectedResults(filterName, filterValues) {
            const counts = {};
            const currentFilterState = this.#activeFilters[filterName] || [];

            filterValues.forEach(({ id, value }) => {
                const isActive = currentFilterState.includes(value);
                const tempFilters = { ...this.#activeFilters };

                if (isActive) {
                    // Show count if this value were removed
                    tempFilters[filterName] = currentFilterState.filter((active) => active !== value);
                } else {
                    // Show count if this value were added
                    tempFilters[filterName] = [...currentFilterState, value];
                }

                counts[id] = this.#computeVisibleIds(tempFilters).length;
            });

            return counts;
        }

        /** @returns {{ [name: string]: string[] }} */
        get activeFilters() {
            return { ...this.#activeFilters };
        }

        /** @returns {string} */
        get searchTerm() {
            return this.#searchTerm;
        }
    }

    /**
     * Pure utility for reading and writing URL hash parameters.
     * Multiple components share a single hash string; each caller owns its key(s)
     * and preserves all others.
     *
     * Format: #search=term&category=val1,val2&color=val3
     * Values within a key are comma-separated; commas in values are stripped on write.
     */

    const valueSeparator = ',';

    /**
     * Strips commas from a single value to prevent collision with the separator.
     * @param {string} value
     * @returns {string}
     */
    const sanitizeValue = (value) => value.replace(/,/g, '');

    /**
     * Parses the current location.hash into a map of key → string[].
     * @param {string} hash - The hash string (e.g. location.hash)
     * @returns {{ [key: string]: string[] }}
     */
    const readHash = (hash) => {
        const raw = hash.startsWith('#') ? hash.slice(1) : hash;
        if (!raw) return {};
        const result = {};
        raw.split('&').forEach((pair) => {
            const index = pair.indexOf('=');
            if (index === -1) return;
            const key = decodeURIComponent(pair.slice(0, index));
            const rawValue = decodeURIComponent(pair.slice(index + 1));
            result[key] = rawValue.split(valueSeparator).filter(Boolean);
        });
        return result;
    };

    /**
     * Serializes a key → string[] map back into a hash string (without leading #).
     * @param {{ [key: string]: string[] }} params
     * @returns {string}
     */
    const serializeHash = (params) => {
        const pairs = Object.entries(params)
            .filter(([, values]) => values.length > 0)
            .map(([key, values]) => {
                const joined = values.map(sanitizeValue).join(valueSeparator);
                return `${encodeURIComponent(key)}=${encodeURIComponent(joined)}`;
            });
        return pairs.join('&');
    };

    /**
     * Writes a single key to the hash, preserving all other keys.
     * @param {string} currentHash - The current hash string (e.g. location.hash)
     * @param {string} key - The key to write
     * @param {string[]} values - The values to write
     * @returns {string} - The new hash string (without leading #)
     */
    const writeHashKey = (currentHash, key, values) => {
        const params = readHash(currentHash);
        params[key] = values;
        return serializeHash(params);
    };

    /**
     * Removes a single key from the hash, preserving all other keys.
     * @param {string} currentHash - The current hash string (e.g. location.hash)
     * @param {string} key - The key to remove
     * @returns {string} - The new hash string (without leading #)
     */
    const removeHashKey = (currentHash, key) => {
        const params = readHash(currentHash);
        delete params[key];
        return serializeHash(params);
    };

    /**
     * Orchestrator web component for faceted search. Manages child registration,
     * enforces constraints, creates the model from child data, delegates updates
     * between model and children, and restores state from URL hash.
     */

    /* global HTMLElement */

    class FacetedSearch extends HTMLElement {

        /** @type {object|null} FacetedSearchInput component */
        #searchComponent = null;

        /** @type {object[]} FacetedSearchFilterValues components */
        #filterComponents = [];

        /** @type {object|null} FacetedSearchResultReader component */
        #readerComponent = null;

        /** @type {object|null} FacetedSearchResultUpdater component */
        #updaterComponent = null;

        /** @type {FacetedSearchModel|null} */
        #model = null;

        /** @type {boolean} */
        #fuzzy;

        /** @type {boolean} */
        #orderByRelevance;

        constructor() {
            super();
            this.#fuzzy = readAttribute(this, 'data-fuzzy-search', {
                transform: (value) => value !== null,
            });
            this.#orderByRelevance = readAttribute(this, 'data-order-by-relevance', {
                transform: (value) => value !== null,
            });
        }

        connectedCallback() {
            this.#listenForRegistration('facetedSearchRegisterSearchInput', this.#registerSearchInput);
            this.#listenForRegistration('facetedSearchRegisterFilterValues', this.#registerFilterValues);
            this.#listenForRegistration('facetedSearchRegisterResultReader', this.#registerReader);
            this.#listenForRegistration('facetedSearchRegisterResultUpdater', this.#registerUpdater);
            this.#listenForRegistration('facetedSearchUnregisterSearchInput', this.#unregisterSearchInput);
            this.#listenForRegistration('facetedSearchUnregisterFilterValues', this.#unregisterFilterValues);
            this.#listenForRegistration('facetedSearchUnregisterResultReader', this.#unregisterReader);
            this.#listenForRegistration('facetedSearchUnregisterResultUpdater', this.#unregisterUpdater);

            this.addEventListener('facetedSearchTermChange', (ev) => {
                this.#handleSearchTermChange(ev.detail.term);
            });
            this.addEventListener('facetedSearchFilterChange', (ev) => {
                const { name, value, selected } = ev.detail;
                this.#handleFilterChange(name, value, selected);
            });
        }

        /**
         * Registers a listener for a child registration/unregistration event,
         * extracting the component reference from `detail.element`.
         * @param {string} eventName
         * @param {Function} handler
         */
        #listenForRegistration(eventName, handler) {
            this.addEventListener(eventName, (ev) => {
                handler.call(this, ev.detail?.element);
            });
        }

        /** @param {object} component */
        #registerSearchInput(component) {
            if (!component) throw new Error('FacetedSearch: registerSearchInput requires detail.element.');
            if (this.#searchComponent) {
                console.warn('FacetedSearch: Multiple search inputs registered. Only the latest will be used.');
            }
            this.#searchComponent = component;
            this.#buildModel();
        }

        /** @param {object} component */
        #unregisterSearchInput(component) {
            if (this.#searchComponent === component) {
                this.#searchComponent = null;
            }
        }

        /** @param {object} component */
        #registerFilterValues(component) {
            if (!component) throw new Error('FacetedSearch: registerFilterValues requires detail.element.');
            const data = component.getFilterData();
            const duplicate = this.#filterComponents.find(
                (existing) => existing.getFilterData().name === data.name,
            );
            if (duplicate) {
                throw new Error(`FacetedSearch: Duplicate filter name "${data.name}".`);
            }
            this.#filterComponents.push(component);
            this.#buildModel();
        }

        /** @param {object} component */
        #unregisterFilterValues(component) {
            this.#filterComponents = this.#filterComponents.filter((existing) => existing !== component);
            this.#buildModel();
        }

        /** @param {object} component */
        #registerReader(component) {
            if (!component) throw new Error('FacetedSearch: registerResultReader requires detail.element.');
            this.#readerComponent = component;
            this.#buildModel();
        }

        /** @param {object} component */
        #unregisterReader(component) {
            if (this.#readerComponent === component) {
                this.#readerComponent = null;
                this.#model = null;
            }
        }

        /** @param {object} component */
        #registerUpdater(component) {
            if (!component) throw new Error('FacetedSearch: registerResultUpdater requires detail.element.');
            this.#updaterComponent = component;
            this.#updateChildren();
        }

        /** @param {object} component */
        #unregisterUpdater(component) {
            if (this.#updaterComponent === component) {
                this.#updaterComponent = null;
            }
        }

        /**
         * (Re)builds the model from the currently registered components.
         * Called after every child registration; requires the reader to be
         * present, search input and filters are optional. Rebuilds the model
         * each time so that late-registering components are included.
         */
        #buildModel() {
            if (!this.#readerComponent) return;

            const items = this.#readerComponent.getItemData();

            // Derive filter and search configs from the collected item data
            const filterConfigs = this.#filterComponents.map(
                (component) => ({ name: component.getFilterData().name }),
            );
            const searchConfigs = items.length > 0
                ? Object.keys(items[0].searchFields).map((field) => ({ field }))
                : [];

            this.#model = new FacetedSearchModel({
                items,
                filterConfigs,
                searchConfigs,
                fuzzy: this.#fuzzy,
                orderByRelevance: this.#orderByRelevance,
            });

            // Restore state before attaching the change listener to avoid
            // redundant #updateChildren calls for each restored value.
            this.#restoreFromHash();
            this.#model.on('change', () => this.#updateChildren());
            this.#updateChildren();
        }

        /** @param {string} term */
        #handleSearchTermChange(term) {
            if (!this.#model) return;
            this.#model.setSearchTerm(term);
            if (this.#searchComponent?.propagateToUrl) {
                this.#writeHash('search', term ? [term] : []);
            }
        }

        /**
         * @param {string} name
         * @param {string} value
         * @param {boolean} selected
         */
        #handleFilterChange(name, value, selected) {
            if (!this.#model) return;
            this.#model.setFilter(name, value, selected);
            const component = this.#filterComponents.find(
                (filter) => filter.getFilterData().name === name,
            );
            if (component?.propagateToUrl) {
                this.#writeHash(name, this.#model.activeFilters[name] || []);
            }
        }

        /**
         * Writes a key/values pair to the URL hash.
         * Removes the key when values are empty.
         * @param {string} key
         * @param {string[]} values
         */
        #writeHash(key, values) {
            const current = location.hash;
            const updated = values.length > 0
                ? writeHashKey(current, key, values)
                : removeHashKey(current, key);
            location.hash = updated;
        }

        /** Pushes current model state to all child components. */
        #updateChildren() {
            if (!this.#model) return;

            if (this.#updaterComponent) {
                const visibleIds = this.#model.getVisibleIds();
                this.#updaterComponent.updateVisibility(visibleIds);
            }

            this.#filterComponents.forEach((component) => {
                const filterData = component.getFilterData();
                const counts = this.#model.getExpectedResults(
                    filterData.name,
                    filterData.values,
                );
                component.updateExpectedResults(counts);
            });
        }

        /** Restores state from the current URL hash. */
        #restoreFromHash() {
            const hashData = readHash(typeof location !== 'undefined' ? location.hash : '');

            if (hashData.search) {
                const term = hashData.search[0];
                this.#model.setSearchTerm(term);
                if (this.#searchComponent) this.#searchComponent.setSearchTerm(term);
            }

            this.#filterComponents.forEach((component) => {
                const filterData = component.getFilterData();
                const values = hashData[filterData.name];
                if (!values) return;
                values.forEach((value) => {
                    component.setChecked(value, true);
                    this.#model.setFilter(filterData.name, value, true);
                });
            });
        }
    }

    /* global window */
    if (!window.customElements.get('faceted-search')) {
        window.customElements.define('faceted-search', FacetedSearch);
    }

})();
