import { isRecord } from "./record";

type User = {
    name: string,
    ageGroup: string,
    role: string,
    logs: {date: string, hours: string, desc: string, log_id: number, reqStatus: string, startTime:string, endTime:string}[]
}

type Admin = {
    name: string,
    role: string,
    accountRequests: {user_id: number, email: string, name:string, dob:string, role:string, decision: string}[],
    logRequests: {log_id: number, name: string, email: string, date: string, hours: string, desc: string, startTime:string, endTime:string, decision: string}[]
}


export const parseUser = (data: unknown): undefined | User => {
    if (!isRecord(data)) return undefined;
    if (typeof data.name !== 'string') return undefined;
    if (typeof data.ageGroup !== 'string') return undefined;
    if (typeof data.role !== 'string') return undefined;
    if (!Array.isArray(data.logs)) return undefined;

    const logs: {date: string, hours: string, desc: string, log_id: number, reqStatus: string, startTime:string, endTime:string}[] = [];
    for (const row of data.logs) {
        if (!isRecord(row)) return undefined;
        if (typeof row.date !== 'string') return undefined;
        if (typeof row.hours !== 'string') return undefined;
        if (typeof row.desc !== 'string') return undefined;
        if (typeof row.log_id !== 'number') return undefined;
        if (typeof row.reqStatus !== 'string') return undefined;
        if (typeof row.startTime !== 'string') return undefined;
        if (typeof row.endTime !== 'string') return undefined;

        logs.push({
            date: row.date,
            hours: row.hours,
            desc: row.desc,
            log_id: row.log_id,
            reqStatus: row.reqStatus,
            startTime: row.startTime,
            endTime: row.endTime
        })
    }

    return {
        name: data.name,
        ageGroup: data.ageGroup,
        role: data.role,
        logs: data.logs
    };

}

export const parseAdmin = (data: unknown): undefined | Admin => {
    if (!isRecord(data)) return undefined;
    if (typeof data.name !== 'string') return undefined;
    if (typeof data.role !== 'string') return undefined;
    if (!Array.isArray(data.accountRequests)) return undefined;

    const acountRequests: {user_id: number, email: string, name:string, dob:string, role:string, decision: string}[] = [];
    for (const row of data.accountRequests) {
        if (!isRecord(row)) return undefined;
        if (typeof row.user_id !== 'number') return undefined;
        if (typeof row.email !== 'string') return undefined;
        if (typeof row.name !== 'string') return undefined;
        if (typeof row.dob !== 'string') return undefined;
        if (typeof row.role !== 'string') return undefined;

        acountRequests.push({
            user_id: row.user_id,
            email: row.email,
            name: row.name,
            dob: row.dob,
            role: row.role,
            decision: ""
        })
    }

    if (!Array.isArray(data.logRequests)) return undefined;
    const logRequests: {log_id: number, name: string, email: string, date: string, hours: string, desc: string, startTime:string, endTime:string, decision: string}[] = [];
    for (const row of data.logRequests) {
        if (!isRecord(row)) return undefined;
        if (typeof row.date !== 'string') return undefined;
        if (typeof row.hours !== 'string') return undefined;
        if (typeof row.desc !== 'string') return undefined;
        if (typeof row.log_id !== 'number') return undefined;
        if (typeof row.name !== 'string') return undefined;
        if (typeof row.email !== 'string') return undefined;
        if (typeof row.startTime !== 'string') return undefined;
        if (typeof row.endTime !== 'string') return undefined;

        logRequests.push({
            date: row.date,
            hours: row.hours,
            desc: row.desc,
            log_id: row.log_id,
            name: row.name,
            email: row.email,
            startTime: row.startTime,
            endTime: row.endTime,
            decision: ""
        })
    }

    return {
        name: data.name,
        role: data.role,
        accountRequests: acountRequests,
        logRequests: logRequests
    };
}


const parseTime = (time: string, date:string): Date => {
    const [hours, minutes] = time.split(':').map(Number);
    const temp = new Date(date)
    temp.setDate(temp.getDate()+1)
    const fulldate = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate(), hours, minutes);
    return fulldate;
}

  
export const isValidTimes = (startTime: string, endTime: string, date: string): boolean => {
    const startDate = parseTime(startTime, date);
    const endDate = parseTime(endTime, date);
    const now = new Date();
  
    return startDate < endDate && endDate < now;
}


export const isValidDate = (stateDate: string):boolean => {
    const date = new Date(stateDate);
    date.setDate(date.getDate() + 1);
    const today = new Date();
    const yearDiff = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    const dayDiff = today.getDate() - date.getDate();
    return (yearDiff>0) || (yearDiff===0 && monthDiff>0) || (yearDiff===0 && monthDiff===0 && dayDiff>=0);
}