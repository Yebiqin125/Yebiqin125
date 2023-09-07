/*
time��2023.4.26
cron: 0 9,18 * * *
new Env('���泵����ǩ��');
΢��С����-���泵����-����һ�
ץ������: https://channel.cheryfs.cn/
ץ������ͷ����: accountId ��ֵ
�����������ƣ�hqcshck = accountId ��ֵ
���˺��½����������� & �ֿ�
*/

import time
import requests
from os import environ, path


def load_send():
    global send
    cur_path = path.abspath(path.dirname(__file__))
    if path.exists(cur_path + "/SendNotify.py"):
        try:
            from SendNotify import send
            print("����֪ͨ����ɹ���")
        except:
            send = False
            print(
                '''����֪ͨ����ʧ��~\n��ʹ�����������ַ\nql repo https://github.com/Bidepanlong/ql.git "bd_" "README" "SendNotify"''')
    else:
        send = False
        print(
            '''����֪ͨ����ʧ��~\n��ʹ�����������ַ\nql repo https://github.com/Bidepanlong/ql.git "bd_" "README" "SendNotify"''')


load_send()


def get_environ(key, default="", output=True):
    def no_read():
        if output:
            print(f"δ��д�������� {key} �����")
            exit(0)
        return default

    return environ.get(key) if environ.get(key) else no_read()


class Hqcsh():
    def __init__(self, ck):
        self.msg = ''
        self.ck = ck
        self.ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF XWEB/6763'
        self.tid = '619669306447261696'

    def sign(self):
        time.sleep(0.5)
        sign_url = "https://channel.cheryfs.cn/archer/activity-api/signinact/signin"
        jf_url = 'https://channel.cheryfs.cn/archer/activity-api/common/accountPointLeft?pointId=620415610219683840'
        q_url = 'https://channel.cheryfs.cn/archer/activity-api/pointsmall/exchangeCard?pointsMallCardId=' + qiang + '&exchangeCount=1&mallOrderInputVoStr=%7B%22person%22:%22%22,%22phone%22:%22%22,%22province%22:%22%22,%22city%22:%22%22,%22area%22:%22%22,%22address%22:%22%22,%22remark%22:%22%22%7D&channel=1&exchangeType=0&exchangeNeedPoints=188&exchangeNeedMoney=0&cardGoodsItemIds='
        sign_headers = {
            'User-Agent': self.ua,
            'tenantId': self.tid,
            'activityId': '620810406813786113',
            'accountId': self.ck,
        }

        jf_headers = {
            'User-Agent': self.ua,
            'tenantId': self.tid,
            'activityId': '621911913692942337',
            'accountId': self.ck,
        }
        q_headers = {
            'User-Agent': self.ua,
            'tenantId': self.tid,
            'activityId': '621950054462152705',
            'accountId': self.ck,
        }
        try:
            sign_rsp = requests.get(sign_url, headers=sign_headers)
            time.sleep(0.5)
            jf_rsp = requests.get(jf_url, headers=jf_headers)
            time.sleep(0.5)
            q_rsp = requests.get(q_url, headers=q_headers)

            if sign_rsp.json()['success'] == True:
                if sign_rsp.json()['result']['success'] == True:
                    if q_rsp.json()['success'] == False:
                        xx = f"[��¼]���˺�{a}��¼�ɹ�\n[ǩ��]��ǩ���ɹ�\n[����]��{jf_rsp.json()['result']}\n[����]����ǰ��������ʱ��Σ�����18-22������\n\n"
                        print(xx)
                        self.msg += xx
                    elif q_rsp.json()['result']['success'] == True:
                        time.sleep(0.5)
                        qr_url = 'https://channel.cheryfs.cn/archer/activity-api/pointsmall/exchangeCardResult?resultKey=' + \
                                 q_rsp.json()['result']['id']
                        qr_rsp = requests.get(qr_url, headers=q_headers)
                        if qr_rsp.json()['result']['errMsg'] == '�ɹ�':
                            xx = f"[��¼]���˺�{a}��¼�ɹ�\n[ǩ��]��ǩ���ɹ�\n[����]��{jf_rsp.json()['result']}\n[����]��{qr_rsp.json()['result']['errMsg']}��ǰ����������-�ҵ�����鿴��\n\n"
                            print(xx)
                            self.msg += xx
                        else:
                            xx = f"[��¼]���˺�{a}��¼�ɹ�\n[ǩ��]��ǩ���ɹ�\n[����]��{jf_rsp.json()['result']}\n[����]��{qr_rsp.json()['result']['errMsg']}\n\n"
                            print(xx)
                            self.msg += xx
                    elif q_rsp.json()['result']['success'] == False:
                        xx = f"[��¼]���˺�{a}��¼�ɹ�\n[ǩ��]��ǩ���ɹ�\n[����]��{jf_rsp.json()['result']}\n[����]��{q_rsp.json()['result']['errMsg']}\n\n"
                        print(xx)
                        self.msg += xx
                elif sign_rsp.json()['result']['success'] == False:
                    if q_rsp.json()['success'] == False:
                        xx = f"[��¼]���˺�{a}��¼�ɹ�\n[ǩ��]��{sign_rsp.json()['result']['message']}\n[����]��{jf_rsp.json()['result']}\n[����]����ǰ��������ʱ��Σ�����18-22������\n\n"
                        print(xx)
                        self.msg += xx
                    elif q_rsp.json()['result']['success'] == True:
                        time.sleep(0.5)
                        qr_url = 'https://channel.cheryfs.cn/archer/activity-api/pointsmall/exchangeCardResult?resultKey=' + \
                                 q_rsp.json()['result']['id']
                        qr_rsp = requests.get(qr_url, headers=q_headers)
                        if qr_rsp.json()['result']['errMsg'] == '�ɹ�':
                            xx = f"[��¼]���˺�{a}��¼�ɹ�\n[ǩ��]��{sign_rsp.json()['result']['message']}\n[����]��{jf_rsp.json()['result']}\n[����]��{qr_rsp.json()['result']['errMsg']}��ǰ����������-�ҵ�����鿴��\n\n"
                            print(xx)
                            self.msg += xx
                        else:
                            xx = f"[��¼]���˺�{a}��¼�ɹ�\n[ǩ��]��{sign_rsp.json()['result']['message']}\n[����]��{jf_rsp.json()['result']}\n[����]��{qr_rsp.json()['result']['errMsg']}\n\n"
                            print(xx)
                            self.msg += xx
                    elif q_rsp.json()['result']['success'] == False:
                        xx = f"[��¼]���˺�{a}��¼�ɹ�\n[ǩ��]��{sign_rsp.json()['result']['message']}\n[����]��{jf_rsp.json()['result']}\n[����]��{q_rsp.json()['result']['errMsg']}\n\n"
                        print(xx)
                        self.msg += xx
            elif sign_rsp.json()['success'] == False:
                xx = f"[��¼]���˺�{a}��¼ʧ�ܣ����Ժ����Ի���ck����ʧЧ,��ǰck��{self.ck}\n\n"
                print(xx)
                self.msg += xx
            else:
                xx = f"[��¼]���˺�{a}��¼ʧ�ܣ����Ժ����Ի���ck����ʧЧ,��ǰck��{self.ck}\n\n"
                print(xx)
                self.msg += xx
                return self.msg
            return self.msg
        except Exception as e:
            xx = f"[�����쳣]���Ժ�����\n{e}\n\n"
            print(xx)
            self.msg += xx
            return self.msg

    def get_sign_msg(self):
        return self.sign()


if __name__ == '__main__':
    q1 = '647894196522340352'  # 188���� 1.08Ԫ
    q2 = '622187839353806848'  # 288���� 1.88Ԫ
    q3 = '622187928306601984'  # 588���� 3.88Ԫ
    q4 = '622188100122075136'  # 888���� 5.88Ԫ
    qiang = q1
    print('\nĬ�������Զ���188����1.08Ԫ�İ�\n��Ҫ���õ��ű��ײ��޸� qiang = xxx\nxxxΪq1-q4��Ӧ�İ�\nע������û����ѭ����ֻ�ύһ�ο��ܻ�ʧ�ܣ�������18��֮��ʱ�ظ����м���\n')
    token = get_environ("hqcshck")
    msg = ''
    cks = token.split("&")
    print("��⵽{}��ck��¼\n��ʼHqcshǩ��\n".format(len(cks)))
    a = 0
    for ck in cks:
        a += 1
        run = Hqcsh(ck)
        msg += run.get_sign_msg()
    if send:
        send("���泵����ǩ��֪ͨ", msg)
