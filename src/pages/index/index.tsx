import React, { useState } from "react";
import { Span, View } from "@tarojs/components";
import {
  ConfigProvider,
  Cell,
  Tag,
  Swipe,
  Button,
} from "@nutui/nutui-react-taro";
import zhCN from "@nutui/nutui-react-taro/dist/locales/zh-CN";
import dayjs from "dayjs";
import { getUUID, db } from "src/utils";
import Addpopup from "./add-popup";
import DatePicker from "./date-picker";

import "./index.scss";
function Index() {
  const [locale, setLocale] = useState(zhCN);
  const [date, setDate] = useState(dayjs().format("YYYY/MM/DD"));
  const dbData = db.get();
  const [records, setRecords] = useState(dbData[date] || []);

  const [popVisible, setPopVisible] = useState(false);
  const [popInitData, setPopInitData] = useState();

  const [tags, setTags] = useState([
    {
      name: "拉屎",
      type: "single",
      unit: "",
      color: "red",
    },
    {
      name: "撒尿",
      type: "single",
      unit: "",
      color: "blue",
    },
    {
      name: "喂奶",
      type: "input",
      unit: "mL",
      color: "green",
    },
    {
      name: "黄疸",
      type: "input",
      unit: "",
    },
    {
      name: "体温",
      type: "input",
      unit: "℃",
    },
    {
      name: "身高",
      type: "input",
      unit: "cm",
    },
    {
      name: "体重",
      type: "input",
      unit: "g",
    },
  ]);

  function onPopConfirm(formData) {
    setPopVisible(false);

    // 修改
    if (formData.id) {
      setRecords((oldRecords) => {
        const index = oldRecords.findIndex((item) => item.id === formData.id);
        oldRecords[index] = {
          ...formData,
        };
        const newRecords = [...oldRecords];
        updateDbRecords(date, newRecords);
        return newRecords;
      });
      return;
    }

    // 新增
    setRecords((oldRecords) => {
      const newRecords = [
        ...oldRecords,
        {
          ...formData,
          id: getUUID(),
        },
      ];
      updateDbRecords(date, newRecords);
      return newRecords;
    });
  }

  function updateDbRecords(date, records) {
    const data = db.get();
    data[date] = records;
    db.set(data);
  }

  function renderTags(record) {
    const list: any[] = [];
    Object.entries(record).forEach(([key, value]) => {
      if (key === "time" || key === "id") {
        return;
      }
      list.push(
        <Tag style={{ marginRight: "8px" }} background={value.color}>
          {key}
          {value.value}
          {value.unit}
        </Tag>
      );
    });
    return list;
  }

  function onAddClick() {
    setPopVisible(true);
    setPopInitData();
  }

  function onAddPopClose() {
    setPopVisible(false);
  }

  function onCellClick(record) {
    return () => {
      setPopVisible(true);
      setPopInitData(record);
    };
  }

  function onDelRecord(record) {
    return () => {
      setRecords((oldRecords) => {
        const newRecords = oldRecords.filter((item) => item.id !== record.id);
        updateDbRecords(date, newRecords);
        return newRecords;
      });
    };
  }

  function onDateChange(e) {
    setDate(e);
    const dbData = db.get();
    setRecords(dbData[e] || []);
  }

  return (
    <ConfigProvider locale={locale}>
      <View className="nutui-react-demo">
        <DatePicker value={date} onChange={onDateChange} />
        <div>
          {records.map((record, index) => {
            return (
              <div
                className="record-item"
                key={record.id}
                onClick={onCellClick(record)}
              >
                <Swipe
                  rightAction={
                    <Button
                      type="primary"
                      shape="square"
                      onClick={onDelRecord(record)}
                    >
                      删除
                    </Button>
                  }
                >
                  <div className="record-item-inner">
                    <div className="record-title">
                      {record.time.split(" ")[1]}
                    </div>
                    <div>{renderTags(record)}</div>
                  </div>
                </Swipe>
              </div>
            );
          })}
        </div>
        <View className="add-btn" onClick={onAddClick}>
          <i className="iconfont icon-addition_fill"></i>
        </View>
        <Addpopup
          visible={popVisible}
          tags={tags}
          initData={popInitData}
          onConfirm={onPopConfirm}
          onClose={onAddPopClose}
        ></Addpopup>
      </View>
    </ConfigProvider>
  );
}

export default Index;
