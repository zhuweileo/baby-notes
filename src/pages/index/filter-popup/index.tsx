import React, { useState, useEffect, useRef } from "react";
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
  const checkboxgroup2Ref = useRef(null);
  const initCheck = props.tags.map((item) => item.name);
  const [checkboxgroup2, setCheckboxgroup2] = useState(initCheck);

  const [showDatepicker, setShowDatepicker] = useState(false);
  const defaultTime = dayjs().format("YYYY/MM/DD HH:mm");
  const startDate = new Date(2020, 0, 1);
  const endDate = new Date(2025, 10, 1);

  const [formData, setFormData] = useState({
    time: defaultTime,
  });

  const handleChange = (value: any) => {};

  function onConfirm() {
    props.onConfirm();
  }

  return (
    <View className="add-btn-wrap">
      <Popup
        title="过滤"
        visible={props.visible}
        position="top"
        onClose={() => {
          props.onClose();
        }}
        lockScroll
      >
        <View className="popup-content">
          <Cell title="类型">
            <Checkbox.Group
              labelPosition="left"
              direction="horizontal"
              ref={checkboxgroup2Ref}
              defaultValue={checkboxgroup2}
              onChange={(value) => handleChange(value)}
            >
              {props.tags.map((tag) => {
                return <Checkbox value={tag.name}>{tag.name}</Checkbox>;
              })}
            </Checkbox.Group>
          </Cell>
          <Button block type="primary" onClick={onConfirm}>
            确认
          </Button>
        </View>
      </Popup>
    </View>
  );
}

export default Index;
