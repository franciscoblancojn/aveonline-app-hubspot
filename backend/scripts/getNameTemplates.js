const main = () => {
    const listN = document.querySelectorAll('.el-table--enable-row-transition .el-table__body td.el-table__cell:first-child .cell');
    const listText = []
    for (let i = 0; i < listN.length; i++) {
        listText.push(listN[i].innerText);
    }
    console.log(listText);
    
}
main()