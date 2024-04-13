import React, { useState } from 'react'
import GenericTemplate from '../templates/GenericTemplate'
import DateFnsUtils from '@date-io/date-fns'
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import { makeStyles } from '@material-ui/core/styles'
import { format } from 'date-fns'
import jaLocale from 'date-fns/locale/ja'
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
// import CommonDialog, { ButtonType } from '../atoms/CommonDialog';
import SelectItemDivButton from '../atoms/ItemDivSelectBox'

/**
 * 注文登録画面
 */
const OrderRegistrationPage: React.FC = () => {
  const classes = useStyles()
  // 購入日入力情報
  const [date, setDate] = useState<Date | null>(new Date())
  // 表示用行情報
  const [nowRow, setRow] = useState<rowTyped[]>([
    {
      rowId: 0,
      itemName: '',
      itemDiv: '',
      itemCount: '',
    },
  ])
  // 選択行情報
  const [selected, setSelected] = useState<readonly number[]>([])
  // 登録エラーフラグ
  const [registErrorFlg, setRegistErrorFlg] = useState<boolean>(false)
  // const [digOpen, setDigOpen] = useState(false);

  // 行情報の型定義
  type rowTyped = {
    rowId: number
    itemName: string
    itemDiv: string
    itemCount: string
  }

  /**
   * 日付変更処理
   * @param newDate
   */
  const changeDateHandler = (newDate: Date | null): void => {
    setDate(newDate)
  }

  /**
   * 行追加処理
   */
  const addRow = () => {
    let rowsAll: rowTyped[] = []
    // 現在の行数に1行追加(配列の最後のindexに1加算して追加)
    rowsAll.push({
      rowId: nowRow.slice(-1)[0].rowId + 1,
      itemName: '',
      itemDiv: '',
      itemCount: '',
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
    // 選択行が存在する場合のみ削除する
    if (selectedRows.length !== 0) {
      for (let i = 0; i < selectedRows.length; i++) {
        if (i === 0) {
          // 初回は、現在行から選択行以外を切り出し
          rowsAll = nowRow.filter((row) => Number(selectedRows[i].id) !== row.rowId)
        } else {
          // 2回目以降は、切り出し済みの行から選択行以外を切り出し
          rowsAll = rowsAll.filter((row) => Number(selectedRows[i].id) !== row.rowId)
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
   * 入力チェック後、入力情報を注文テーブルに登録する。
   */
  const registerData = async () => {
    // 未入力が存在する行は登録しない
    const sendData = nowRow.filter((row) => {
      return row.itemName && row.itemDiv && Number(row.itemCount) > 0
    })

    // 対象行数分登録処理を実行
    sendData.map(async (row) => {
      // 商品ID取得
      let mcndId = await getMcndId(row.itemName, row.itemDiv)
      // 注文登録処理
      orderResister(date, mcndId, row.itemCount)
    })
    // 正常終了メッセージ表示
    if (!registErrorFlg) {
      alert('登録完了しました。')
    }
  }

  /**
   * 商品ID取得処理
   * @param itemName 商品名
   * @param itemDiv 商品区分名
   * @return 商品ID
   */
  const getMcndId = async (itemName: string, itemDiv: string): Promise<string> => {
    // クエリパラメータ生成
    const params = {
      mcndName: itemName,
      mcndDivName: itemDiv,
    }
    const queryParams = new URLSearchParams(params)

    // 商品ID取得
    let response = await fetch('getMcndId?' + queryParams, { method: 'GET' })
    if (response.status !== 200) {
      alert('入力情報に誤りがある為、登録出来ませんでした。')
    }
    let resjson = await response.json()
    let message = resjson.message

    return message
  }

  /**
   * 注文登録処理
   * @param itemDiv 商品区分名
   * @return 商品ID
   */
  const orderResister = (date: Date | null, mcndId: string, itemCount: string) => {
    let formattedDate: string = ''
    if (date) {
      formattedDate = date
        .toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
        .split('/')
        .join('')
    } else {
      alert('システムエラー。登録内容を確認して下さい。')
    }
    const reqestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prcsYmd: formattedDate, id: mcndId, qnty: itemCount }),
    }
    // 登録処理
    fetch('orderResister', reqestOptions).catch((err) => {
      alert('システムエラー。登録内容を確認して下さい。')
      setRegistErrorFlg(true)
    })
  }

  /**
   * テキストフィールド入力イベント
   * @param fieldName
   * @param id
   * @param inputValue
   */
  const textValueChanged = (fieldName: string, id: number, inputValue: string) => {
    // 変更箇所により分岐
    if (fieldName === 'itemName') {
      // 商品名
      nowRow[id].itemName = inputValue
    } else if (fieldName === 'itemDiv') {
      // 商品区分
      nowRow[id].itemDiv = inputValue
    } else {
      // 個数
      nowRow[id].itemCount = inputValue
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
    <GenericTemplate title="注文登録画面">
      <MuiPickersUtilsProvider utils={JaLocalizedUtils} locale={jaLocale}>
        <DatePicker
          value={date}
          format="yyyy年M月d日"
          onChange={changeDateHandler}
          label="購入日"
          style={{ paddingBottom: '20px' }}
        />
      </MuiPickersUtilsProvider>
      <form>
        <TableContainer component={Paper} className={classes.tableContainer}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead className={classes.tableHead}>
              <TableRow>
                <TableCell>選択</TableCell>
                <TableCell>商品名</TableCell>
                <TableCell>区分</TableCell>
                <TableCell align="left">個数</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nowRow !== null &&
                nowRow.map((row) => (
                  <TableRow
                    hover
                    role="checkbox"
                    id={row.rowId.toString()}
                    key={row.rowId}
                    selected={isSelected(row.rowId)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        checked={isSelected(row.rowId)}
                        onClick={(event) => handleClick(event, row.rowId)}
                        inputProps={{
                          'aria-labelledby': `enhanced-table-checkbox-${row}`,
                        }}
                      />
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <TextField
                        className={classes.itemNameTextField}
                        onChange={(e) =>
                          textValueChanged(
                            'itemName',
                            Number(e.target.closest('.MuiTableRow-root')?.id),
                            e.target.value
                          )
                        }
                      />
                    </TableCell>
                    {/* <TableCell component="th" scope="row">
                      <TextField
                        className={classes.itemDivTextField}
                        onChange={(e) =>
                          textValueChanged('itemDiv', Number(e.target.closest('.MuiTableRow-root')?.id), e.target.value)
                        }
                      />
                    </TableCell> */}
                    <TableCell align="right">
                      <th>
                        <SelectItemDivButton />
                      </th>
                    </TableCell>
                    <TableCell>
                      <TextField
                        id="outlined-number"
                        label=""
                        type="number"
                        InputProps={{ inputProps: { min: 0 } }}
                        InputLabelProps={{
                          shrink: true,
                        }}
                        defaultValue="0"
                        onChange={(e) =>
                          textValueChanged(
                            'itemCount',
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
      {/* <CommonDialog
        title="削除確認"
        message="選択した行を削除しますか？"
        buttonType={ButtonType.YesNo}
        open={digOpen}
        onAccept={() => deleteRow()}
        onClose={() => setDigOpen(false)}
      /> */}
      <Button variant="outlined" className={classes.deleteButton} startIcon={<ClearIcon />} onClick={() => deleteRow()}>
        行削除
      </Button>
      <Button variant="contained" className={classes.resiterButton} onClick={registerData}>
        登録
      </Button>
    </GenericTemplate>
  )
}

/**
 * 日付入力ダイアログヘッダ部のフォーマット用クラス
 */
class JaLocalizedUtils extends DateFnsUtils {
  getDatePickerHeaderText(date: Date) {
    return format(date, 'M月d日(E)', { locale: this.locale })
  }
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
  divButton: {
    marginTop: '10px',
  },
  itemNameTextField: {
    fontSize: 1,
  },
  itemDivTextField: {
    fontSize: 1,
  },
  addButton: {
    position: 'relative',
    left: '100px',
  },
  deleteButton: {
    position: 'relative',
    left: '120px',
  },
  resiterButton: {
    position: 'relative',
    left: '735px',
  },
})

export default OrderRegistrationPage
