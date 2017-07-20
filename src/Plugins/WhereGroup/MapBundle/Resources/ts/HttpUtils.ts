// import

export enum HTTP_METHOD {POST, GET}
;
export enum HTTP_DATATYPE {xml, json, html, script}
;

interface IMetador {
    displayError(message: string);
}
declare var metador: IMetador;

interface IUploadProgress {
    setProgress(total: number, done: number): void;
    complete(): void;
}
export class SimpleProgress implements IUploadProgress { // TODO

    setProgress(total: number, done: number): void {
        let val = Math.floor(done / total * 1000) / 10; // in %
        console.log(val);
    }

    complete(): void {
        console.log('complete');
    }
}

export class Http {
    public static sendForm(form: HTMLFormElement,
                           url: string, method: HTTP_METHOD = HTTP_METHOD.POST,
                           async: boolean = true,
                           progress: IUploadProgress = null,
                           user?: string,
                           password?: string){ //: Promise<any> {
        // return new Promise<any>(
        //     function (resolve, reject) {
        //         const xhr = new XMLHttpRequest();
        //         if (progress !== null) {
        //             // xhr.addEventListener('progress', function (e: any) {
        //             //     let done = e.position || e.loaded, total = e.totalSize || e.total;
        //             //     console.log('xhr progress: ' + (Math.floor(done / total * 1000) / 10) + '%');
        //             // }, false);
        //             if (xhr.upload) {
        //                 xhr.upload.onprogress = function (e: any) {
        //                     let done = e.position || e.loaded, total = e.totalSize || e.total;
        //                     console.log('xhr.upload progress: ' + done + ' / ' + total + ' = ' + (Math.floor(done / total * 1000) / 10) + '%');
        //                     progress.setProgress(e.totalSize || e.total, e.position || e.loaded);
        //                 };
        //             }
        //             xhr.onreadystatechange = function (e: Event) {
        //                 if (4 == this.readyState) {
        //                     console.log(['xhr upload complete', e]);
        //                     progress.complete();
        //                 }
        //             };
        //         }
        //         xhr.onload = function () {
        //             if (xhr.status === 200) {
        //                 if (xhr.response && xhr.response.status && xhr.response.status === 'error') {
        //                     metador.displayError(xhr.response.message);
        //                     reject(xhr.response.message);
        //                 }
        //                 let data = xhr.response;
        //                 delete data['status'];
        //                 delete data['message'];
        //                 resolve(xhr.response);
        //             } else {
        //                 reject(new Error(xhr.statusText));
        //             }
        //         };
        //         xhr.onerror = function () {
        //             metador.displayError(xhr.response.message);
        //             reject(new Error('XMLHttpRequest Error: ' + xhr.statusText));
        //         };
        //         xhr.open(HTTP_METHOD[method], url, async, user, password);
        //         xhr.send(new FormData(form));
        //     }
        // );
    }

    public static sendGET(url: string) { // @TODO
        // return new Promise(
        //     function (resolve, reject) {
        //         const request = new XMLHttpRequest();
        //         request.onload = function () {
        //             if (request.status === 200) {
        //                 resolve(request.response);
        //             } else {
        //                 reject(new Error(request.statusText));
        //             }
        //         };
        //         request.onerror = function () {
        //             reject(new Error(
        //                 'XMLHttpRequest Error: ' + request.statusText));
        //         };
        //         request.open('GET', url);
        //         request.send();
        //     });
    }

    //
    // public static uploadFile(url, files: FileList) {
    //     return new Promise(
    //         function (resolve, reject) {
    //             const xhr = new XMLHttpRequest();
    //             xhr.addEventListener('progress', function (e: any) {
    //                 let done = e.position || e.loaded, total = e.totalSize || e.total;
    //                 console.log('xhr progress: ' + (Math.floor(done / total * 1000) / 10) + '%');
    //             }, false);
    //             if (xhr.upload) {
    //                 xhr.upload.onprogress = function (e: any) {
    //                     let done = e.position || e.loaded, total = e.totalSize || e.total;
    //                     console.log('xhr.upload progress: ' + done + ' / ' + total + ' = ' + (Math.floor(done / total * 1000) / 10) + '%');
    //                 };
    //             }
    //             xhr.onreadystatechange = function (e) {
    //                 if (4 == this.readyState) {
    //                     console.log(['xhr upload complete', e]);
    //                 }
    //             };
    //             xhr.onload = function () {
    //                 if (xhr.status === 200) {
    //                     resolve(xhr.response);
    //                 } else {
    //                     reject(new Error(xhr.statusText));
    //                 }
    //             };
    //             xhr.onerror = function () {
    //                 reject(new Error('XMLHttpRequest Error: ' + xhr.statusText));
    //             };
    //             xhr.open('POST', url, true);
    //             xhr.setRequestHeader("Content-Type", "multipart/form-data");
    //             let formData = new FormData();
    //             console.log(files);
    //             formData.append("thefile", files[0]);
    //             xhr.send(formData);
    //         });
    // }
}
//
// function httpGet(url) {
//     return new Promise(
//         function (resolve, reject) {
//             const request = new XMLHttpRequest();
//             request.onload = function () {
//                 if (request.status === 200) {
//                     // Success
//                     resolve(request.response);
//                 } else {
//                     // Something went wrong (404 etc.)
//                     reject(new Error(request.statusText));
//                 }
//             };
//             request.onerror = function () {
//                 reject(new Error(
//                     'XMLHttpRequest Error: '+request.statusText));
//             };
//             request.open('GET', url);
//             request.send();
//         });
// }