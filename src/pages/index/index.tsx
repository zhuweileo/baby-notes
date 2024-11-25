import React, { useState, useEffect, useRef } from "react";
import { Span, View } from "@tarojs/components";
import { useDidShow, useDidHide } from "@tarojs/taro";
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
import FilterPop from "./filter-popup";

import "./index.scss";

const initTags = [
  {
    name: "拉屎",
    type: "single",
    unit: "",
    color: "#95e1d3",
    order: 0,
  },
  {
    name: "撒尿",
    type: "single",
    unit: "",
    color: "#ff5722",
    order: 1,
  },
  {
    name: "喂奶",
    type: "input",
    unit: "mL",
    color: "#3f72af",
    countSum: true,
    order: 2,
  },
  {
    name: "母乳",
    type: "input",
    unit: "min",
    color: "#cca8e9",
    countSum: true,
    order: 2,
  },
  {
    name: "睡觉",
    type: "input",
    unit: "h",
    color: "#393e46",
    countSum: true,
    order: 3,
  },
  {
    name: "吸奶",
    type: "input",
    unit: "h",
    color: "#ffde7d",
    countSum: true,
    order: 4,
  },
  {
    name: "体温",
    type: "input",
    unit: "℃",
    color: "#fc5185",
    order: 5,
  },
  {
    name: "身高",
    type: "input",
    unit: "cm",
    color: "#fcbad3",
    order: 6,
  },
  {
    name: "体重",
    type: "input",
    unit: "g",
    color: "#aa96da",
    order: 7,
  },
  {
    name: "黄疸",
    type: "input",
    unit: "",
    color: "#f38181",
    order: 8,
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

  const [addpopVisible, setAddPopVisible] = useState(false);
  const [popInitData, setPopInitData] = useState();

  // 次数统计
  const [countList, setCountList] = useState([]);
  useEffect(() => {
    const counts = tags.map((tag) => {
      let count = 0;
      let sum = 0;
      records.forEach((record) => {
        const recordCell = record[tag.name];
        if (recordCell) {
          count++;
          if (tag.countSum && recordCell.value) {
            sum += Number(recordCell.value);
          }
        }
      });

      return {
        ...tag,
        count,
        sum,
      };
    });
    setCountList(counts);
  }, [tags, records]);

  // 过滤器
  const [filterPopVisible, setFilterPopVisible] = useState(false);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [filter, setFilter] = useState(initTags.map((item) => item.name));
  useEffect(() => {
    if (!filter.length) {
      setFilteredRecords(records);
      return;
    }
    const res = records
      .map((record) => {
        const newRecord = {};
        newRecord.id = record.id;
        newRecord.time = record.time;
        Object.keys(record).forEach((key) => {
          if (filter.includes(key)) {
            newRecord[key] = record[key];
          }
        });
        return newRecord;
      })
      .filter((record) => {
        const keys = Object.keys(record).filter(
          (key) => key !== "id" && key !== "time"
        );
        return keys.length;
      });
    setFilteredRecords(res);
  }, [records, filter]);

  // 从后台打开时更新日期
  useDidShow(() => {
    onDateChange(dayjs().format("YYYY/MM/DD"));
  });

  function onPopConfirm(formData) {
    setAddPopVisible(false);

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
    let list: any[] = [];
    Object.entries(record).forEach(([key, value]) => {
      if (key === "time" || key === "id") {
        return;
      }
      list.push(value);
    });
    list.sort((a, b) => a.order - b.order);
    list = list.filter((item) => item.checked || item.value);
    return list.map((item) => {
      return (
        <Tag style={{ marginRight: "8px" }} background={item.color}>
          {item.name}
          {item.value}
          {item.unit}
        </Tag>
      );
    });
  }

  function onAddClick() {
    setAddPopVisible(true);
    setPopInitData();
  }

  function onAddPopClose() {
    setAddPopVisible(false);
  }

  function onCellClick(record) {
    return () => {
      setAddPopVisible(true);
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
    setRecords(initRecords(dbData[e] || [], initTags));
    setFilter([]);
  }

  function onFilterClick() {
    setFilterPopVisible(true);
  }

  function onFilterConfirm(e) {
    setFilter(e);
    setFilterPopVisible(false);
  }

  function onFilterClose() {
    setFilterPopVisible(false);
  }

  // 计算出生天数
  const [bownDays, setBownDays] = useState(0);
  useEffect(() => {
    var start = dayjs("2024/8/29");
    var now = dayjs(date);
    var days = now.diff(start, "days");
    setBownDays(days);
  }, [date]);

  // 计算出生天数
  const [bownDays1, setBownDays1] = useState(0);
  useEffect(() => {
    var start = dayjs("1992/11/17");
    var now = dayjs(date);
    var days = now.diff(start, "days");
    setBownDays1(days);
  }, [date]);

  // 生日快乐
  const timer = useRef(0);
  const [showBirthday, setShowBirthday] = useState(false);
  function hideBirthDay() {
    setShowBirthday(false);
    if (timer.current) {
      clearInterval(timer.current);
    }
  }

  function showBirtyDay() {
    const need = needShowBirthDay();
    need && setShowBirthday(true);
  }

  function needShowBirthDay() {
    // 当时间范围在 2024/11/23 00:00 - 2024/11/23 23:59 时显示生日快乐
    const now = dayjs();
    const start = dayjs("2024/11/23 00:00");
    const end = dayjs("2024/11/23 23:59");
    return now.isAfter(start) && now.isBefore(end);
  }

  useEffect(() => {
    const need = needShowBirthDay();
    setShowBirthday(need);
    timer.current = setInterval(() => {
      const need = needShowBirthDay();
      setShowBirthday(need);
    }, 3000);
    return () => {
      clearInterval(timer.current);
    };
  }, []);

  const isFengBirthday = needShowBirthDay();

  return (
    <ConfigProvider locale={locale}>
      {showBirthday ? (
        <div className="happy-birthday" onClick={hideBirthDay}></div>
      ) : null}
      <View className="nutui-react-demo">
        <View className="header-wrap">
          <DatePicker value={date} onChange={onDateChange} />
          <i className="iconfont icon-shaixuan" onClick={onFilterClick}></i>
        </View>
        {isFengBirthday ? (
          <View className="bown-detail" onClick={showBirtyDay}>
            🥳阿凤出生{bownDays1}天🥳
          </View>
        ) : (
          <View className="bown-detail" onClick={showBirtyDay}>
            🐲阿康出生{bownDays}天🐲
          </View>
        )}
        <View className="count-list">
          <View className="item-wrap">
            {countList.map((count) => {
              return (
                <View className="count-item">
                  <Tag background={count.color} style={{ marginRight: "4px" }}>
                    {count.name}
                  </Tag>
                  {count.count}次
                  {count.countSum ? (
                    <>
                      {count.sum}
                      {count.unit}
                    </>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
        <div className="records-list">
          {filteredRecords.map((record, index) => {
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
          visible={addpopVisible}
          tags={tags}
          initData={popInitData}
          onConfirm={onPopConfirm}
          onClose={onAddPopClose}
        ></Addpopup>
        <FilterPop
          filter={filter}
          visible={filterPopVisible}
          tags={tags}
          onConfirm={onFilterConfirm}
          onClose={onFilterClose}
        ></FilterPop>
      </View>
    </ConfigProvider>
  );
}

export default Index;
