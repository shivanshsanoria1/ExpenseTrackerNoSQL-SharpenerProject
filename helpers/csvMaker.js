exports.csvMaker = (arr) => {
    if(arr.length === 0){
        return '';
    }

    const result = [Object.keys(arr[0])];
    for(obj of arr){
        result.push(Object.values(obj).toString());
    }

    return result.join('\n');
}
