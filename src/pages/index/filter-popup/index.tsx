import React, { useState, useEffect, useRef } from "react";
import { View } from "@tarojs/components";
import { Popup, Checkbox, Cell, Button } from "@nutui/nutui-react-taro";
import "./index.scss";
function Index(props) {
  const checkboxgroup2Ref = useRef(null);
  const [checkboxgroup2, setCheckboxgroup2] = useState(props.filter);

  useEffect(() => {
    if (props.visible) {
      setCheckboxgroup2(props.filter);
    }
  }, [props.filter, props.visible]);

  const handleChange = (value: any) => {
    setCheckboxgroup2(value);
  };

  function onConfirm() {
    props.onConfirm(checkboxgroup2);
  }

  function onReset() {
    setCheckboxgroup2([]);
    props.onConfirm([]);
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
              value={checkboxgroup2}
              onChange={(value) => handleChange(value)}
            >
              {props.tags.map((tag) => {
                return <Checkbox value={tag.name}>{tag.name}</Checkbox>;
              })}
            </Checkbox.Group>
          </Cell>
          <Button
            block
            type="primary"
            fill="outline"
            style={{ marginBottom: "8px" }}
            onClick={onReset}
          >
            重置
          </Button>
          <Button block type="primary" onClick={onConfirm}>
            确认
          </Button>
        </View>
      </Popup>
    </View>
  );
}

export default Index;
