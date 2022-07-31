import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import { getUser } from "../lib/api";
import { getPayload, isUserAuthenticated } from "../lib/auth";

import "./support.css";

export function Support() {
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
    const { data } = await getUser(userId);
    set_email(data.email);
    email_ = data.email;
    if (data.isSuperuser) {
      set_super(true);
      is_super_user_ = true;
    }
    console.log(email_);
  };

  //获取当前登录人的工单
  const devUrl = `http://127.0.0.1:8000`;
  const prodUrl = ``;
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
      }
      let res = await axios.post(`${baseUrl}/add/`, data);
      data['id'] = res.data['id'];
      data['creat_time'] = res.data['creat_time'];
      console.log(res);
      set_contents((old_arr) => [...old_arr, data])
    }
  }

  //delete
  const delete_one = async (e) => {
    const id_ = e.currentTarget.dataset.id;
    let res = await axios.get(`${baseUrl}/del/${id_}/`);
    if (res.data['state'] == 'ok') {
      set_contents(contents.filter(item => item.id != id_));
    }
  }

  //回复
  const update_reply = async (e) => {
    const id_ = e.currentTarget.dataset.id;
    const textarea = document.getElementById('textarea__' + id_.toString());
    //console.log(id_);
    //console.log(textarea.value);
    //存入数据库
    const data = {
      id: id_,
      reply: textarea.value,
    }
    let res = await axios.post(`${baseUrl}/update/`, data);
    //console.log(res);
    const newState = contents.map(obj => {
      if (obj.id == id_) {
        return { ...obj, reply: textarea.value, reply_time: res.data['reply_time'] };
      }
      return obj;
    });
    set_contents(newState);
  }


  //如果是在登录状态下，获取用户信息，获取工单
  useEffect(async () => {
    if (isUserAuthenticated()) {
      await getUserInfo();
      if (email_) {
        await update_content_state(email_);
      }
    }
  }, [])

  return (
    <>
      <div className="support">

        {
          contents.map((item, index) => {
            return (
              <div className="card" key={item.id}>
                <div className="user_info">
                  <span>created by {item.email} at {item.creat_time}</span>
                </div>
                <div className="detail">
                  <span className="large_font">
                    {item.content}
                  </span>
                </div>
                <div className="reply">
                  {item.reply != "" ? (
                    <span>reply at {item.reply_time}:</span>
                  ) : (
                    <span>no reply yet</span>
                  )}

                  {
                    is_super_user ? (
                      <>
                        <span className="large_font">
                          {item.reply}
                        </span>
                        <textarea placeholder="please input your reply..." id={"textarea__" + item.id.toString()}>
                        </textarea>
                        <div className="reply_btn_div">
                          <button data-id={item.id} onClick={e => update_reply(e)}>
                            <span>reply</span>
                          </button>
                          <button data-id={item.id} onClick={e => delete_one(e)}>
                            <span>delete</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <span className="large_font">
                        {item.reply}
                      </span>
                    )
                  }
                </div>
              </div>
            )
          })
        }
      </div >

      {is_super_user ? (
        <span></span>
      ) : (
        < div className="fixed_input_div" >
          <div className="input_div">
            <textarea ref={text_input} placeholder="please input your problems..." rows="3" cols="80">
            </textarea>
            <button onClick={(e) => add_content(e)} data-email={email}>
              <span>add</span>
            </button>
          </div>
        </div >
      )
      }

    </>
  );
}