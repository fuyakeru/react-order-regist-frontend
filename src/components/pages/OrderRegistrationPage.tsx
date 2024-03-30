import React, { useState } from "react";
import GenericTemplate from "../templates/GenericTemplate";
import DateFnsUtils from '@date-io/date-fns'
import { DatePicker, MuiPickersUtilsProvider } from '@material-ui/pickers'
import { makeStyles } from "@material-ui/core/styles";
import { format } from 'date-fns'
import jaLocale from 'date-fns/locale/ja'
import Table from "@material-ui/core/Table";
import TableHead from "@material-ui/core/TableHead";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import Paper from "@material-ui/core/Paper";
import SelectItemDivButton from "../atoms/ItemDivSelectBox";

// 日付入力ダイアログヘッダ部のフォーマット用クラス
class JaLocalizedUtils extends DateFnsUtils {
  getDatePickerHeaderText(date: Date) {
    return format(date, 'M月d日(E)', { locale: this.locale })
  }
}

// 表データ作成
const createData = (
  name: string,
  weight: number,
) => {
  return { name, weight };
};

// 表データ
const rows = [
  createData("Tシャツ", 3),
  createData("ズボン", 2),
  createData("ねぎ", 1),
  createData("春菊", 1),
  createData("牛肩ロース肉(薄切り)", 1),
];

// style定義
const useStyles = makeStyles({
  tableContainer: {
    width: 900,
    margin: "20px 100px",
  },
  table: {
    minWidth: 500,
  },
  tableHead: {
    backgroundColor: "#D9E5FF",
  }
});

// 注文登録画面
const OrderRegistrationPage: React.FC = () => {
  const classes = useStyles();
  const [date, setDate] = useState<Date | null>(new Date())
  const changeDateHandler = (newDate: Date | null): void => {
    setDate(newDate)
  }

  return (
    <GenericTemplate title="注文登録画面">
      <MuiPickersUtilsProvider utils={JaLocalizedUtils} locale={jaLocale}>
        <DatePicker
          value={date}
          format="yyyy年M月d日"
          onChange={changeDateHandler}
          label="購入日"
          style={{ paddingBottom: "20px" }} />
      </MuiPickersUtilsProvider>
      <TableContainer component={Paper} className={classes.tableContainer}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead className={classes.tableHead}>
            <TableRow>
              <TableCell>商品名</TableCell>
              <TableCell align="right">区分</TableCell>
              <TableCell align="right">個数</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name}>
                <TableCell component="th" scope="row">
                  {row.name}
                </TableCell>
                <TableCell align="right" component={SelectItemDivButton}></TableCell>
                <TableCell align="right">{row.weight}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </GenericTemplate>
  );
};

export default OrderRegistrationPage;
