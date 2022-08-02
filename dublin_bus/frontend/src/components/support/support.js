import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

import { useTheme } from "../../hooks";
import { getUser } from "../../lib/api";
import { getPayload, isUserAuthenticated } from "../../lib/auth";
import {MessageCard} from "./message_card"

import "./support.css";

export function Support() {
  const [is_dark] = useTheme();
  //cases currently logged into email
  const [contents, set_contents] = useState([]);

  //textarea's ref
  const text_input = useRef();

  //current email
  const [email, set_email] = useState(null);
  let email_ = null;
  //if is the super user
  const [is_super_user, set_super] = useState(false);
  let is_super_user_ = false;

  //get user's information and set current status
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

  //get current user's case
  const devUrl = `http://127.0.0.1:8000`;
  const prodUrl = ``;
  const baseUrl = process.env.NODE_ENV === "production" ? prodUrl : devUrl;
  const get_content = (email_) => {
    return axios.get(`${baseUrl}/get/${email_}/`);
  }

  //get all cases
  const get_all_content = () => {
    return axios.get(`${baseUrl}/get/all/`)
  }

  //refresh case status
  const update_content_state = async (email_) => {
    let data = null;
    //admin get the case
    if (is_super_user_) {
      data = await get_all_content();
    }
    //user get the case 
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

  //add the case to database
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
      text_input.current.value='';
    }
  }

  //If you are logged in, get user information, get cases
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
              <MessageCard key={item.id} item={item} is_super_user={is_super_user} contents={contents} set_contents={set_contents} />
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