import React, { useState, useEffect } from "react";
import { View } from "@tarojs/components";
import {
  ConfigProvider,
  Popup,
  Form,
  Checkbox,
  Input,
  Cell,
  DatePicker,
  Button,
} from "@nutui/nutui-react-taro";
import dayjs from "dayjs";
import "./index.scss";
function Index(props) {
  const [showDatepicker, setShowDatepicker] = useState(false);
  const defaultTime = dayjs().format("YYYY/MM/DD HH:mm");
  const startDate = new Date(2020, 0, 1);
  const endDate = new Date(2025, 10, 1);

  const [formData, setFormData] = useState({
    time: defaultTime,
  });

  useEffect(() => {
    setFormData(
      props.initData
        ? props.initData
        : {
            time: defaultTime,
          }
    );
  }, [props.initData]);

  function datePickerConfirm(options, value) {
    setFormData((oldValue) => {
      return {
        ...oldValue,
        time: dayjs().format(`YYYY/MM/DD ${value.join(":")}`),
      };
    });
  }

  function onCheck(tag) {
    return (e) => {
      updateTagValue(tag, "checked", e);
    };
  }

  function onValueInput(tag) {
    return (e) => {
      updateTagValue(tag, "value", e);
    };
  }

  function updateTagValue(tag, key, value) {
    if (formData[tag.name]) {
      setFormData((oldFormData) => {
        return {
          ...oldFormData,
          [tag.name]: {
            ...oldFormData[tag.name],
            [key]: value,
          },
        };
      });
    } else {
      setFormData((oldFormData) => {
        return {
          ...oldFormData,
          [tag.name]: {
            ...tag,
            [key]: value,
          },
        };
      });
    }
  }

  function onConfirm() {
    props.onConfirm(formData);
    setFormData({
      time: defaultTime,
    });
  }

  return (
    <View className="add-btn-wrap">
      <Popup
        title="记录"
        visible={props.visible}
        position="bottom"
        onClose={() => {
          props.onClose();
        }}
        lockScroll
      >
        <div className="popup-content">
          <Cell
            title="记录时间"
            description={formData.time.split(" ")[1]}
            onClick={() => setShowDatepicker(true)}
          />
          <DatePicker
            title="时间选择"
            type="hour-minutes"
            value={new Date(formData.time)}
            startDate={startDate}
            endDate={endDate}
            visible={showDatepicker}
            onClose={() => setShowDatepicker(false)}
            onConfirm={(options, values) => datePickerConfirm(options, values)}
          />
          <Cell
            title="记录内容"
            description={
              <>
                {props.tags.map((tag) => {
                  return (
                    <div className="tag-item">
                      <Checkbox
                        style={{ marginInlineEnd: "8px" }}
                        label={tag.name}
                        checked={formData[tag.name]?.checked || false}
                        onChange={onCheck(tag)}
                      />
                      {tag.type === "input" ? (
                        <div className="tag-input">
                          <Input
                            value={formData[tag.name]?.value || ""}
                            onChange={onValueInput(tag)}
                          ></Input>
                          {tag.unit ? <span>{tag.unit}</span> : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </>
            }
          ></Cell>
          <Button block type="primary" onClick={onConfirm}>
            确认
          </Button>
        </div>
      </Popup>
    </View>
  );
}

export default Index;
