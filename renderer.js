const { ipcRenderer } = require('electron');
import ArTalk from 'ar-talk-sdk';

new Vue({
    el: '#app',
    data: {
        clientUid: '002', // 客户端 UID
        channelId: '0000', // 频道 ID
        client: null, // ArTalk 客户端实例
        channel: null, // 频道实例
        isLoggingIn: false, // 正在登录状态
        isTalking: false, // 对讲状态
        isLoggedIn: false, // 登录状态
        token: '', // 令牌
    },
    mounted() {
        this.initClient(); // 初始化客户端
        this.loginAndJoinChannel(); // 登录并加入频道

        ipcRenderer.on('gpio-button-pressed', () => {
            this.toggleCall();
        });
    },
    methods: {
        // 初始化客户端
        initClient() {
            this.client = ArTalk.createInstance('977ef3ef3abeb13a02f7bb8195729aa9'); // 创建 ArTalk 客户端实例
            this.client.on('ConnectionStateChanged', (newState, reason) => {
                console.log('连接状态改变为 ' + newState + ' 原因: ' + reason);
            });
        },
        // 登录并加入频道
        loginAndJoinChannel() {
            this.isLoggingIn = true;
            const options = {
                token: this.token, // 令牌
                uid: this.clientUid // 客户端 UID
            };

            this.client.login(options).then(() => {
                console.log('ArTalk 客户端登录成功');
                this.isLoggedIn = true;
                this.channel = this.client.createChannel(this.channelId); // 创建频道实例

                this.channel.join().then(() => {
                    console.log('成功加入频道');
                    this.isLoggingIn = false; // 加入完成

                    // 监听频道事件
                    this.channel.on('UserIsTalkOn', (channelId, userId, userData, userLevel) => {
                        console.log("用户开始对讲", channelId, userId, userData, userLevel);
                    });

                    this.channel.on('UserIsTalkOff', (channelId, userId, userData) => {
                        console.log("用户结束对讲", channelId, userId, userData);
                    });

                    this.channel.on('BreakTalk', (memberId) => {
                        console.log("对讲被打断", memberId);
                    });

                    this.channel.on('UserIsStreamOn', (channelId, userId, userData) => {
                        console.log("用户开始广播", channelId, userId, userData);
                    });

                    this.channel.on('UserIsStreamOff', (channelId, userId, userData) => {
                        console.log("用户结束广播", channelId, userId, userData);
                    });

                }).catch(error => {
                    console.log('加入频道失败', error);
                    this.isLoggingIn = false;
                });

            }).catch(err => {
                console.log('ArTalk 客户端登录失败', err);
                this.isLoggingIn = false;
            });
        },
        // 切换对讲状态
        toggleCall() {
            if (this.isTalking) {
                this.endCall();
            } else {
                this.startCall();
            }
        },
        // 开始对讲
        startCall() {
            if (!this.isLoggedIn) {
                console.log('未登录，无法开始对讲');
                return;
            }

            this.channel.pushToTalk().then(() => {
                console.log('开始对讲成功');
                this.isTalking = true;
            }).catch(error => {
                console.log('开始对讲失败', error);
            });
        },
        // 结束对讲并离开频道
        endCall() {
            if (!this.isLoggedIn) {
                console.log('未登录，无法结束对讲');
                return;
            }

            this.channel.stopPushToTalk().then(() => {
                console.log('结束对讲成功');
                this.isTalking = false;
            }).catch(error => {
                console.log('结束对讲失败', error);
            });
        }
    }
});
