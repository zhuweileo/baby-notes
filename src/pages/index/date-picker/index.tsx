import React, { useState } from "react";
import { Calendar } from "@nutui/nutui-react-taro";
import "./index.scss";
function Index(props) {
  const [isVisible, setIsVisible] = useState(false);

  function onClose() {
    setIsVisible(false);
  }

  function onConfirm(e) {
    props.onChange(e[3]);
  }

  return (
    <div className="date-picker">
      <div className="date-display" onClick={() => setIsVisible(true)}>
        {props.value}
      </div>
      <Calendar
        autoBackfill
        startDate="2024/08/29"
        endDate="2028/08/29"
        visible={isVisible}
        defaultValue={props.value}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    </div>
  );
}

export default Index;
