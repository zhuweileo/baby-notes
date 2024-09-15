import React, { useState, useEffect } from "react";
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

const initTags = [
  {
    name: "拉屎",
    type: "single",
    unit: "",
    color: "#95e1d3",
  },
  {
    name: "撒尿",
    type: "single",
    unit: "",
    color: "#ff5722",
  },
  {
    name: "喂奶",
    type: "input",
    unit: "mL",
    color: "#3f72af",
  },
  {
    name: "黄疸",
    type: "input",
    unit: "",
    color: "#f38181",
  },
  {
    name: "体温",
    type: "input",
    unit: "℃",
    color: "#fc5185",
  },
  {
    name: "身高",
    type: "input",
    unit: "cm",
    color: "#fcbad3",
  },
  {
    name: "体重",
    type: "input",
    unit: "g",
    color: "#aa96da",
  },
];

function initRecords(records, tags) {
  return records.map((record) => {
    Object.keys(record).forEach((key) => {
      const tag = tags.find((tag) => tag.name === key);
      if (tag) {
        record[key] = {
          ...record[key],
          ...tag,
        };
      }
    });
    return {
      ...record,
    };
  });
}

function Index() {
  const [locale, setLocale] = useState(zhCN);
  const [date, setDate] = useState(dayjs().format("YYYY/MM/DD"));
  const dbData = db.get();
  const [tags, setTags] = useState(initTags);
  const [records, setRecords] = useState(
    initRecords(dbData[date] || [], initTags)
  );

  const [popVisible, setPopVisible] = useState(false);
  const [popInitData, setPopInitData] = useState();

  // 次数统计
  const [countList, setCountList] = useState([]);
  useEffect(() => {
    const counts = tags.map((tag) => {
      let count = 0;
      records.forEach((record) => {
        if (record[tag.name]) {
          count++;
        }
      });

      return {
        ...tag,
        count,
      };
    });
    setCountList(counts);
  }, [tags, records]);

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
        <View className="count-list">
          <View className="item-wrap">
            {countList.map((count) => {
              return (
                <View className="count-item">
                  {count.name}: {count.count}次
                </View>
              );
            })}
          </View>
        </View>
        <div className="records-list">
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
