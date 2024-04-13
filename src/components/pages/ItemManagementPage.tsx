import React, { useEffect, useState } from 'react'
import GenericTemplate from '../templates/GenericTemplate'
import { makeStyles } from '@material-ui/core/styles'
import Table from '@material-ui/core/Table'
import TableHead from '@material-ui/core/TableHead'
import TableBody from '@material-ui/core/TableBody'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableContainer from '@material-ui/core/TableContainer'
import Paper from '@material-ui/core/Paper'
import { TextField, Button, Checkbox } from '@mui/material'
import AddIcon from '@material-ui/icons/Add'
import ClearIcon from '@material-ui/icons/Clear'

const ItemManagementPage: React.FC = () => {
  const classes = useStyles()

  // 初回起動時処理
  useEffect(() => {
    const getMcndData = async () => {
      let response = await fetch('getMcndData', { method: 'GET' })
      if (response.status !== 200) {
        alert('商品情報の取得に失敗しました。')
      }
      let resjson = await response.json()
      let rowsAll: rowTyped[] = []
      resjson.res.map((row: rowTyped) => {
        rowsAll.push({
          MCND_ID: row.MCND_ID,
          MCND_DIV_NAME: row.MCND_DIV_NAME,
          MCND_NAME: row.MCND_NAME,
          SALE_AMNT: row.SALE_AMNT,
          COST_AMNT: row.COST_AMNT,
          newFlg: false,
        })
        return rowsAll
      })
      setRow(rowsAll)
      setFirstMaxIndex(rowsAll.length - 1)
    }
    getMcndData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 表示用行情報
  const [nowRow, setRow] = useState<rowTyped[]>([])

  // 初回取得データ数
  const [firstMaxIndex, setFirstMaxIndex] = useState<number>(0)

  // 選択行情報
  const [selected, setSelected] = useState<readonly number[]>([])

  // 行情報の型定義
  type rowTyped = {
    MCND_ID: number
    MCND_DIV_NAME: string
    MCND_NAME: string
    SALE_AMNT: number
    COST_AMNT: number
    newFlg: boolean // true:新規,false:既存
  }

  /**
   * 行追加処理
   */
  const addRow = () => {
    let rowsAll: rowTyped[] = []
    // 現在の行数に1行追加(配列の最後のindexに1加算して追加)
    rowsAll.push({
      MCND_ID: nowRow.slice(-1)[0].MCND_ID + 1,
      MCND_DIV_NAME: '',
      MCND_NAME: '',
      SALE_AMNT: 0,
      COST_AMNT: 0,
      newFlg: true,
    })
    rowsAll = nowRow.concat(rowsAll)
    setRow(rowsAll)
  }

  /**
   * 行削除処理
   */
  const deleteRow = () => {
    let rowsAll: rowTyped[] = []
    // 選択行を取得
    const selectedRows = Array.from(document.getElementsByClassName('Mui-selected'))
    // 選択行が存在する場合
    if (selectedRows.length !== 0) {
      for (let i = 0; i < selectedRows.length; i++) {
        // 選択行に登録済み情報が含まれている場合、削除しない
        if (firstMaxIndex >= Number(selectedRows[i].id)) {
          alert('登録済み情報は、行削除出来ません。')
          return
        } else {
          if (i === 0) {
            // 初回は、現在行から選択行以外を切り出し
            rowsAll = nowRow.filter((row) => Number(selectedRows[i].id) !== row.MCND_ID)
          } else {
            // 2回目以降は、切り出し済みの行から選択行以外を切り出し
            rowsAll = rowsAll.filter((row) => Number(selectedRows[i].id) !== row.MCND_ID)
          }
        }
      }
      // 0行になる場合、削除しない
      if (rowsAll.length !== 0) {
        // 切り出した行を現在行に設定
        setRow(rowsAll)
      }
    }
  }

  /**
   * 登録処理
   * 入力チェック後、入力情報を商品管理テーブルに登録する。
   */
  const registerData = async () => {
    // 登録対象行データ
    let rowsAll: rowTyped[] = []
    // 選択行を取得
    const selectedRows = Array.from(document.getElementsByClassName('Mui-selected'))
    // 選択行が存在する場合
    if (selectedRows.length !== 0) {
      for (let i = 0; i < selectedRows.length; i++) {
        // 選択行かつ全項目入力されている行が登録対象
        rowsAll.push(
          nowRow.filter(
            (row) =>
              Number(selectedRows[i].id) === row.MCND_ID &&
              row.MCND_DIV_NAME &&
              row.MCND_NAME &&
              Number(row.SALE_AMNT) > 0 &&
              Number(row.COST_AMNT) > 0
          )[0]
        )
      }
      const reqestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registerData: rowsAll }),
      }
      // 登録処理実行
      let response = await fetch('itemResister', reqestOptions)
      if (response.status !== 200) {
        alert('商品の登録に失敗しました。')
      } else {
        alert('登録完了しました。')
      }
    } else {
      //　選択行が存在しない場合、エラー
      alert('登録対象が選択されていません。')
    }
  }

  /**
   * 削除処理
   * 商品管理テーブルの情報を削除する。
   */
  const deleteData = async () => {
    // 削除対象行データ
    let rowsAll: rowTyped[] = []
    // 選択行を取得
    const selectedRows = Array.from(document.getElementsByClassName('Mui-selected'))
    // 選択行が存在する場合
    if (selectedRows.length !== 0) {
      for (let i = 0; i < selectedRows.length; i++) {
        // 選択行かつ新旧フラグ=false(既存)行が削除対象
        rowsAll.push(nowRow.filter((row) => Number(selectedRows[i].id) === row.MCND_ID && row.newFlg === false)[0])
      }
      const reqestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deleteData: rowsAll }),
      }
      // 削除処理実行
      let response = await fetch('itemDelete', reqestOptions)
      if (response.status !== 200) {
        alert('商品の削除に失敗しました。')
      } else {
        alert('削除完了しました。')
      }
    } else {
      //　選択行が存在しない場合、エラー
      alert('削除対象が選択されていません。')
    }
  }

  /**
   * テキストフィールド入力イベント
   * @param fieldName
   * @param id
   * @param inputValue
   */
  const textValueChanged = (fieldName: string, id: number, inputValue: string) => {
    // 変更箇所により分岐
    if (fieldName === 'mcndDivName') {
      // 商品区分名
      nowRow[id].MCND_DIV_NAME = inputValue
    } else if (fieldName === 'mcndName') {
      // 商品名
      nowRow[id].MCND_NAME = inputValue
    } else if (fieldName === 'saleAmount') {
      // 販売金額
      nowRow[id].SALE_AMNT = Number(inputValue)
    } else {
      // 原価
      nowRow[id].COST_AMNT = Number(inputValue)
    }
    setRow(nowRow)
  }

  /**
   * チェックボックス選択時処理
   * @param rowId
   * @returns
   */
  const isSelected = (rowId: number) => selected.indexOf(rowId) !== -1

  /**
   * チェックボックスクリック時処理
   * @param event
   * @param rowId
   */
  const handleClick = (event: React.MouseEvent<unknown>, rowId: number) => {
    const selectedIndex = selected.indexOf(rowId)
    let newSelected: readonly number[] = []

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, rowId)
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1))
    } else if (selectedIndex === selected.length) {
      newSelected = newSelected.concat(selected.slice(0, -1))
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1))
    }
    setSelected(newSelected)
  }

  return (
    <GenericTemplate title="商品管理画面">
      <form>
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>選択</TableCell>
                <TableCell>区分</TableCell>
                <TableCell>商品名</TableCell>
                <TableCell>販売金額</TableCell>
                <TableCell>原価</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nowRow !== null &&
                nowRow.map((row) => (
                  <TableRow
                    hover
                    role="checkbox"
                    id={row.MCND_ID.toString()}
                    key={row.MCND_ID}
                    selected={isSelected(row.MCND_ID)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isSelected(row.MCND_ID)}
                        onClick={(event) => handleClick(event, row.MCND_ID)}
                        inputProps={{
                          'aria-labelledby': `enhanced-table-checkbox-${row}`,
                        }}
                      />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <TextField
                        className={classes.itemDivTextField}
                        defaultValue={row.MCND_DIV_NAME}
                        onChange={(e) =>
                          textValueChanged(
                            'mcndDivName',
                            Number(e.target.closest('.MuiTableRow-root')?.id),
                            e.target.value
                          )
                        }
                      />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <TextField
                        className={classes.itemNameTextField}
                        defaultValue={row.MCND_NAME}
                        onChange={(e) =>
                          textValueChanged(
                            'mcndName',
                            Number(e.target.closest('.MuiTableRow-root')?.id),
                            e.target.value
                          )
                        }
                      />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <TextField
                        className={classes.salesAmountTextField}
                        defaultValue={row.SALE_AMNT}
                        onChange={(e) =>
                          textValueChanged(
                            'saleAmount',
                            Number(e.target.closest('.MuiTableRow-root')?.id),
                            e.target.value
                          )
                        }
                      />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <TextField
                        className={classes.costAmountTextField}
                        defaultValue={row.COST_AMNT}
                        onChange={(e) =>
                          textValueChanged(
                            'costAmount',
                            Number(e.target.closest('.MuiTableRow-root')?.id),
                            e.target.value
                          )
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </form>
      <Button variant="outlined" className={classes.addButton} startIcon={<AddIcon />} onClick={addRow}>
        行追加
      </Button>
      <Button
        variant="outlined"
        className={classes.rowDeleteButton}
        startIcon={<ClearIcon />}
        onClick={() => deleteRow()}
      >
        行削除
      </Button>
      <Button variant="contained" className={classes.deleteButton} onClick={deleteData}>
        削除
      </Button>
      <Button variant="contained" className={classes.resiterButton} onClick={registerData}>
        登録
      </Button>
    </GenericTemplate>
  )
}
/**
 * style定義
 */
const useStyles = makeStyles({
  tableContainer: {
    width: 900,
    margin: '20px 100px',
  },
  table: {
    minWidth: 500,
  },
  tableHead: {
    backgroundColor: '#D9E5FF',
  },
  itemDivTextField: {
    fontSize: 1,
  },
  itemNameTextField: {
    fontSize: 1,
  },
  salesAmountTextField: {
    fontSize: 1,
  },
  costAmountTextField: {
    fontSize: 1,
  },
  addButton: {
    position: 'relative',
    left: '100px',
  },
  rowDeleteButton: {
    position: 'relative',
    left: '110px',
  },
  deleteButton: {
    position: 'relative',
    left: '643px',
  },
  resiterButton: {
    position: 'relative',
    left: '673px',
  },
})
export default ItemManagementPage
