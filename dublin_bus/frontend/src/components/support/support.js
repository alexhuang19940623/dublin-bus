import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import { useTheme } from "../../hooks";
import { getPayload, isUserAuthenticated } from "../../lib/auth";
import {MessageCard} from "./message_card"

import "./support.css";

export function Support() {
  const [is_dark] = useTheme();
  //当前登录email的工单
  const [contents, set_contents] = useState([]);

  //textarea的ref
  const text_input = useRef();

  //当前登录的email
  const [email, set_email] = useState(null);
  let email_ = null;
  //是否管理员
  const [is_super_user, set_super] = useState(false);
  let is_super_user_ = false;

  //获取用户信息,设置状态
  const getUserInfo = async () => {
    const userId = getPayload().sub;

    const headers = () => {
      return {
        headers: {
          Authorization: `Bearer ${window.localStorage.getItem("token")}`,
        },
      };
    };

    const { data } = await ((userId) => {
      return axios.get(`${baseUrl}/api/auth/profile/${userId}/`, headers());
    })(userId);

    set_email(data.email);
    email_ = data.email;
    if (data.isSuperuser) {
      set_super(true);
      is_super_user_ = true;
    }
    console.log(data)
    console.log(email_);
  };

  //获取当前登录人的工单
  const devUrl = `http://127.0.0.1:8000`;
  const prodUrl = `http://127.0.0.1:8000`;
  const baseUrl = process.env.NODE_ENV === "production" ? prodUrl : devUrl;
  const get_content = (email_) => {
    return axios.get(`${baseUrl}/get/${email_}/`);
  }

  //获取所有人的工单
  const get_all_content = () => {
    return axios.get(`${baseUrl}/get/all/`)
  }

  //更新工单状态
  const update_content_state = async (email_) => {
    let data = null;
    //管理员获取所有工单
    if (is_super_user_) {
      data = await get_all_content();
    }
    //一般用户获取自己的工单 
    else {
      data = await get_content(email_);
    }

    if (data != null) {
      const contents = data.data;
      for (let i = 0; i < contents.length; i++) {
        console.log(contents[i]);
        set_contents((old_arr) => [...old_arr, contents[i]])
      }
    }
  }

  //添加当前人的新工单到数据库
  const add_content = async (e) => {
    const email_ = e.currentTarget.dataset.email
    console.log(email_);
    if (email_ != null) {
      const data = {
        'email': email_,
        'content': text_input.current.value,
        'reply': '',
        'reply_time': '',
        'reply_email':'',
      }
      let res = await axios.post(`${baseUrl}/add/`, data);
      data['id'] = res.data['id'];
      data['creat_time'] = res.data['creat_time'];
      console.log(res);
      set_contents((old_arr) => [...old_arr, data])
      text_input.current.value='';
    }
  }

  //如果是在登录状态下，获取用户信息，获取工单
  useEffect(() => {
    const ready = async () => {
      if (isUserAuthenticated()) {
        await getUserInfo();
        if (email_) {
          await update_content_state(email_);
        }
      }
    }

    ready();

  }, [])

  return (
    <div className="support_div collapse" id='collapse_support' >
      <div className="support">
        {
          contents.map((item, index) => {
            return (
              <MessageCard email={email} key={item.id} item={item} is_super_user={is_super_user} contents={contents} set_contents={set_contents} />
            )
            })
        }
      </div >

      {is_super_user ? (
        <span></span>
      ) : (
        < div className="fixed_input_div" >
          <div className="input_div">
            <textarea ref={text_input} placeholder="please input your problems..." rows="3" cols="80"
            className={`${is_dark ? "t_dark" :""}`}>
            </textarea>
            <button onClick={(e) => add_content(e)} data-email={email}>
              <span>Add</span>
            </button>
          </div>
        </div >
      )
      }

    </div>
  );
}