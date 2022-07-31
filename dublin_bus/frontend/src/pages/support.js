import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import { getUser } from "../lib/api";
import { getPayload, isUserAuthenticated } from "../lib/auth";

import "./support.css";

export function Support() {
  //Cases for the currently logged in email
  const [contents, set_contents] = useState([]);

  //textarea's ref
  const text_input = useRef();

  //The currently logged in email
  const [email, set_email] = useState(null);
  let email_ = null;
  //If the user is super user
  const [is_super_user, set_super] = useState(false);
  let is_super_user_ = false;

  //Get user information, set the user status
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

  //Get the user's case
  const devUrl = `http://127.0.0.1:8000`;
  const prodUrl = ``;
  const baseUrl = process.env.NODE_ENV === "production" ? prodUrl : devUrl;
  const get_content = (email_) => {
    return axios.get(`${baseUrl}/get/${email_}/`);
  }

  //Get all cases
  const get_all_content = () => {
    return axios.get(`${baseUrl}/get/all/`)
  }

  //Refresh user's case status
  const update_content_state = async (email_) => {
    let data = null;
    //super user get all cases
    if (is_super_user_) {
      data = await get_all_content();
    }
    //General user access to their own cases 
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

  //Add content for the current person to the database
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

  //reply
  const update_reply = async (e) => {
    const id_ = e.currentTarget.dataset.id;
    const textarea = document.getElementById('textarea__' + id_.toString());
    //console.log(id_);
    //console.log(textarea.value);
    //save in the database
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


  //If user is logged in, get user information, get cases
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