class Logger {
    constructor() {
        this.retryId = null;
        window.onload = this.fetchIp.bind(this);
    }

    async fetchIp() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            console.log('Client Public IP Address:', data.ip);
            window.ip = data.ip;
        } catch (error) {
            console.error('Error fetching IP:', error);
        }
    }

    async sendOrResendLogs(isResend = false) {
        let log;
        if (isResend) {
            log = [];
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                log.push(JSON.parse(localStorage[key]));
            });
            log = JSON.stringify({ multi: log });
        } else {
            log = JSON.stringify({ ip: window.ip || 'anon', data: msgs }) + '\r\n';
        }

        try {
            const res = await fetch('http://127.0.0.1:9000/log', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: log,
            });

            if (res.ok || res.status === 200) {
                console.log(res.status);
                console.log('Logged');
                if (isResend) {
                    console.log('Logged, clearing storage');
                    localStorage.clear();
                    clearInterval(this.retryId);
                    this.retryId = null;
                }
            } else {
                console.log(res.status);
                throw new Error('Other issue');
            }
        } catch (e) {
            console.warn('Server error, saving locally', e);
            this.saveLog(log);
            if (!isResend && !this.retryId) {
                console.log('Already retrying...');
                this.retryId = setInterval(() => {
                    console.log('Error relogging, retrying in 30');
                    this.sendOrResendLogs(true);
                }, 30000);
            }
        } 
    }

    saveLog(data) {
        localStorage.setItem(Date.now() + Math.random(), data);
        console.log('Saved locally');
    }

}

// Usage
//const logger = new Logger();
//logger.sendOrResendLogs(); // Call this method to send or resend logs
export default Logger;