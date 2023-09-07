/*
΢��С���� zippo��Ա����

ʹ������ʵ�ֵİ汾, �����˼򵥵���̳�

cron: 24 7,19 * * *
*/
const $ = new Env('zippo��Ա����');
const got = require('got');

const envPrefix = 'zippo'
const envSplitor = ['\n','&','@'] //֧�ֶ��ַָ��Ҫ��֤�����ﲻ��������ַ�
const ckNames = [envPrefix+'Cookie'] //����֧�ֶ����

const MAX_THREAD = parseInt(process.env[envPrefix+'Thread']) || 50; //Ĭ����󲢷���
const DEFAULT_TIMEOUT=8000, DEFAULT_RETRY=3;

//����������һЩ����, ����Ҫ����ÿ������д��
const default_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.32(0x1800202f) NetType/WIFI Language/zh_CN';
const Referer = 'https://servicewechat.com/wxaa75ffd8c2d75da7/56/page-frame.html';
const appid = 'wxaa75ffd8c2d75da7';

class BasicClass {
    constructor() {
        this.index = $.userIdx++;
        this.name = '';
        this.valid = true;
        
        //����got��Ĭ�ϳ�ʱ�Ȳ���
        this.got = got.extend({
            retry: {limit:0},
            timeout: DEFAULT_TIMEOUT,
            followRedirect: false,
        })
    }
    //��ÿ���˻���ӡǰ������Լ�������
    log(msg, opt = {}) {
        var m = '', n = $.userCount.toString().length;;
        if (this.index) m += `�˺�[${$.padStr(this.index,n)}]`;
        if (this.name) m += `[${this.name}]`;
        $.log(m + msg, opt);
    }
    //ʹ���Լ���gotʵ������,����ʵ������ÿ���˺��Լ���Ĭ��UA��
    async request(opt) {
        var resp = null, count = 0;
        var fn = opt.fn || opt.url;
        opt.method = opt?.method?.toUpperCase() || 'GET';
        while (count++ < DEFAULT_RETRY) {
            try {
                var err = null;
                const errcodes = ['ECONNRESET', 'EADDRINUSE', 'ENOTFOUND', 'EAI_AGAIN'];
                await this.got(opt).then(t => {
                    resp = t
                }, e => {
                    err = e;
                    resp = e.response;
                });
                if(err) {
                    if(err.name == 'TimeoutError') {
                        this.log(`[${fn}]����ʱ(${err.code})�����Ե�${count}��`);
                    } else if(errcodes.includes(err.code)) {
                        this.log(`[${fn}]�������(${err.code})�����Ե�${count}��`);
                    } else {
                        let statusCode = resp?.statusCode || -1;
                        this.log(`[${fn}]�������(${err.message}), ����[${statusCode}]`);
                        break;
                    }
                } else {
                    break;
                }
            } catch (e) {
                this.log(`[${fn}]�������(${e.message})�����Ե�${count}��`);
            };
        }
        let {statusCode=-1,headers=null,body=null} = resp;
        if (body) try {body = JSON.parse(body);} catch {};
        return {statusCode,headers,result:body};
    }
}
let http = new BasicClass();

class UserClass extends BasicClass {
    constructor(ck) {
        super()
        let info = ck.split('#');
        this.openid = info[0];
        this.session_key = decodeURIComponent(info[1]);
        this.point = 0;
        
        this.got = this.got.extend({
            headers:{
                Connection:'keep-alive',
                'User-Agent': default_UA,
                Referer,
            },
        })
    }
    
    async ininttask() {
        this.valid = false;
        try {
            let options = {
                fn: 'ininttask',
                method: 'post',
                url: `https://membercenter.zippo.com.cn/s2/interface/data.aspx`,
                searchParams: {
                    action: 'ininttask',
                },
                form: {
                    openid: this.openid,
                    session_key: this.session_key,
                    unionid: '',
                    appid,
                },
            }
            let {result} = await this.request(options)
            if(result?.errcode == 0) {
                this.valid = true;
                for(let task of (result?.data?.task || [])) {
                    switch(task.title) {
                        case 'ǩ��':
                            this.log(`����${task.task_status==0?'δ':'��'}ǩ��`);
                            if(task.task_status==0) {
                                await this.signin();
                            }
                            break;
                        default:
                            let str = task.task_status==0 ? 'δ���' : (task.task_status==1 ? '�����δ��ȡ����' : '����ȡ����');
                            this.log(`����[${task.title}] -- ${str}`);
                            switch(Number(task.task_status)) {
                                case 0:
                                    await this.dotask(task,1);
                                    //ע������û����break, ��ô�ű������������ֱ������break, Ҳ���ǻ��Զ�ִ�� await this.dotask(task,2)
                                case 1:
                                    await this.dotask(task,2);
                                    break;
                                default:
                                    break;
                            }
                            break;
                    }
                }
            } else {
                this.log(`��ѯ�˺�����ʧ��`);
            }
        } catch (e) {
            console.log(e)
        }
    }
    
    async signin() {
        try {
            let options = {
                fn: 'signin',
                method: 'post',
                url: `https://membercenter.zippo.com.cn/s2/interface/data.aspx`,
                searchParams: {
                    action: 'signin',
                },
                form: {
                    daykey: $.time('yyyyMMdd'),
                    openid: this.openid,
                    session_key: this.session_key,
                    unionid: '',
                    appid,
                },
            }
            let {result} = await this.request(options)
            if(result?.errcode == 0) {
                this.log(`ǩ���ɹ�`);
            } else {
                this.log(`ǩ��ʧ��[${result?.errcode}]: ${result?.errmsg}`);
            }
        } catch (e) {
            console.log(e)
        }
    }
    
    async dotask(task,acttype) {
        try {
            let str = acttype==1 ? '���' : '��ȡ����';
            let options = {
                fn: 'dotask',
                method: 'post',
                url: `https://membercenter.zippo.com.cn/s2/interface/data.aspx`,
                searchParams: {
                    action: 'dotask',
                },
                form: {
                    taskid: task.taskid,
                    acttype,
                    openid: this.openid,
                    session_key: this.session_key,
                    unionid: '',
                    appid,
                },
            }
            let {result} = await this.request(options)
            if(result?.errcode == 0) {
                this.log(`����[${task.title}]${str}�ɹ�`);
            } else {
                this.log(`����[${task.title}]${str}ʧ��[${result?.errcode}]: ${result?.errmsg}`);
            }
        } catch (e) {
            console.log(e)
        }
    }
    
    async inintmembers() {
        this.valid = false;
        try {
            let options = {
                fn: 'inintmembers',
                method: 'post',
                url: `https://membercenter.zippo.com.cn/s2/interface/data.aspx`,
                searchParams: {
                    action: 'inintmembers',
                },
                form: {
                    openid: this.openid,
                    session_key: this.session_key,
                    unionid: '',
                    appid,
                },
            }
            let {result} = await this.request(options)
            if(result?.errcode == 0) {
                this.valid = true;
                let info = result?.data?.[0];
                if(info) {
                    this.name = info.Mobile__c || '';
                    this.point = info.AvailablePoints__c || 0;
                }
            } else {
                this.log(`��ѯ�˺�ʧ��[${result?.errcode}]: ${result?.errmsg}`);
            }
        } catch (e) {
            console.log(e)
        }
    }
    
    //�������߼�
    async userTask() {
        $.log(`\n============= �˺�[${this.index}] =============`);
        await this.inintmembers();
        if(!this.valid) return;
        await this.ininttask();
        await this.inintmembers();
        this.log(`����: ${this.point}`);
    }
}

!(async () => {
    $.log(`��󲢷���: ${MAX_THREAD}`);
    $.log('');
    
    //��װ�Ķ�ȡ��������, �����Լ�����дҲ����ֱ����, ��ȡ�����˺Ż���� $.userList ��
    $.read_env(UserClass);
    
    //����������������
    for(let user of $.userList) {
        await user.userTask();
    }
    
    //��װ�Ĳ�������, ���Եİ������//ɾ��
    //await $.threadTask('userTask',MAX_THREAD);
    
})()
.catch((e) => $.log(e))
.finally(() => $.exitNow())

function Env(name) {
    return new class {
        constructor(name) {
            this.name = name;
            this.startTime = Date.now();
            this.log(`[${this.name}]��ʼ����\n`, {time: true});
            this.notifyStr = [];
            this.notifyFlag = true;
            this.userIdx = 0;
            this.userList = [];
            this.userCount = 0;
        }
        log(msg, options = {}) {
            let opt = {console: true};
            Object.assign(opt, options);
            if (opt.time) {
                let fmt = opt.fmt || 'hh:mm:ss';
                msg = `[${this.time(fmt)}]` + msg;
            }
            if (opt.notify) this.notifyStr.push(msg);
            if (opt.console) console.log(msg);
        }
        read_env(Class) {
            let envStrList = ckNames.map(x => process.env[x]);
            for (let env_str of envStrList.filter(x => !!x)) {
                let sp = envSplitor.filter(x => env_str.includes(x));
                let splitor = sp.length > 0 ? sp[0] : envSplitor[0];
                for (let ck of env_str.split(splitor).filter(x => !!x)) {
                    this.userList.push(new Class(ck));
                }
            }
            this.userCount = this.userList.length;
            if (!this.userCount) {
                this.log(`δ�ҵ��������������${ckNames.map(x => '['+x+']').join('��')}`, {notify: true});
                return false;
            }
            this.log(`���ҵ�${this.userCount}���˺�`);
            return true;
        }
        async threads(taskName, conf, opt = {}) {
            while (conf.idx < $.userList.length) {
                let user = $.userList[conf.idx++];
                if(!user.valid) continue;
                await user[taskName](opt);
            }
        }
        async threadTask(taskName, thread) {
            let taskAll = [];
            let taskConf = {idx:0};
            while(thread--) taskAll.push(this.threads(taskName, taskConf));
            await Promise.all(taskAll);
        }
        time(t, x = null) {
            let xt = x ? new Date(x) : new Date;
            let e = {
                "M+": xt.getMonth() + 1,
                "d+": xt.getDate(),
                "h+": xt.getHours(),
                "m+": xt.getMinutes(),
                "s+": xt.getSeconds(),
                "q+": Math.floor((xt.getMonth() + 3) / 3),
                S: this.padStr(xt.getMilliseconds(), 3)
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (xt.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for(let s in e) new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length)));
            return t;
        }
        async showmsg() {
            if(!this.notifyFlag) return;
            if(!this.notifyStr.length) return;
            var notify = require('./sendNotify');
            this.log('\n============== ���� ==============');
            await notify.sendNotify(this.name, this.notifyStr.join('\n'));
        }
        padStr(num, length, opt = {}) {
            let padding = opt.padding || '0';
            let mode = opt.mode || 'l';
            let numStr = String(num);
            let numPad = (length > numStr.length) ? (length - numStr.length) : 0;
            let pads = '';
            for (let i=0; i < numPad; i++) {
                pads += padding;
            }
            if (mode == 'r') {
                numStr = numStr + pads;
            } else {
                numStr = pads + numStr;
            }
            return numStr;
        }
        json2str(obj, c, encode = false) {
            let ret = [];
            for (let keys of Object.keys(obj).sort()) {
                let v = obj[keys];
                if(v && encode) v = encodeURIComponent(v);
                ret.push(keys + '=' + v);
            }
            return ret.join(c);
        }
        str2json(str, decode = false) {
            let ret = {};
            for (let item of str.split('&')) {
                if(!item) continue;
                let idx = item.indexOf('=');
                if(idx == -1) continue;
                let k = item.substr(0, idx);
                let v = item.substr(idx + 1);
                if(decode) v = decodeURIComponent(v);
                ret[k] = v;
            }
            return ret;
        }
        randomPattern(pattern, charset = 'abcdef0123456789') {
            let str = '';
            for (let chars of pattern) {
                if (chars == 'x') {
                    str += charset.charAt(Math.floor(Math.random() * charset.length));
                } else if (chars == 'X') {
                    str += charset.charAt(Math.floor(Math.random() * charset.length)).toUpperCase();
                } else {
                    str += chars;
                }
            }
            return str;
        }
        randomString(len, charset = 'abcdef0123456789') {
            let str = '';
            for (let i = 0; i < len; i++) {
                str += charset.charAt(Math.floor(Math.random() * charset.length));
            }
            return str;
        }
        randomList(a) {
            let idx = Math.floor(Math.random() * a.length);
            return a[idx];
        }
        wait(t) {
            return new Promise(e => setTimeout(e, t));
        }
        async exitNow() {
            await this.showmsg();
            let e = Date.now();
            let s = (e - this.startTime) / 1000;
            this.log('');
            this.log(`[${this.name}]���н�������������${s}��`, {time: true});
            process.exit(0);
        }
    }
    (name)
}