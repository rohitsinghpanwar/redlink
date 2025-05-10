import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import deleteIcon from './assets/delete.png';
import copyIcon from './assets/copy.png';
import githubIcon from './assets/github-sign.png';
import linkIcon from './assets/union.png'
import textIcon from './assets/txt-file.png'

import { openDB } from './utils/indexed_db';
import { addReminder } from "./utils/indexed_db";
function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const requestNotificationPermission = async () => {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notification permission granted")
    } else {
      console.log('Notification permission denied')
    }
  }


  const showNotification = (text) => {
    if ("serviceWorker" in navigator && "Notification" in window) {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification("Welcome", {
              body: text,
              icon: "/icon.png",
              badge: "/badge.png"
            });
          });
        } else {
          console.log("Notification permission denied");
        }
      });
    }
  };

  const [details, setDetails] = useState({ name: '', link: '', type: 'text' });
  const [savedlinks, setSavedlinks] = useState(() => JSON.parse(localStorage.getItem('links')) || {});
  const [isToggled, setIsToggled] = useState(false);
  const [reminderForm, setReminderForm] = useState(null)
  const reminderClick = (key) => {
    setReminderForm(reminderForm === key ? null : key); 
};

  const handleReminderCancel = () => {
    setReminderForm(null)
  }

  const [time, setTime] = useState("");
  const [text, setText] = useState("");

  const handleSetReminder = async () => {
    if (!time || !text) {
      alert("Enter both fields");
      return;
    }
    await addReminder(time, text);
    toast.success("Remainder Set Successfully")
    setReminderForm(null)
    setTime(null)
    setText(null)
  };

  const notify = (type) => {
    if (type === 'save') toast.success('Saved Successfully');
    if (type === 'copy') toast('Copied Successfully');
    if (type === 'delete') toast.error('Deleted Successfully');
  };

  const handlesubmit = (e) => {
    e.preventDefault();
    try {
      const prevData = JSON.parse(localStorage.getItem('links')) || {};
      const updateddata = { ...prevData, [details.name]: { content: details.link, type: isToggled ? "link" : "text" } };
      localStorage.setItem('links', JSON.stringify(updateddata));
      notify('save');
      setSavedlinks(updateddata);
      setDetails({ name: '', link: '', type: '' });
    } catch (e) {
      console.log('Error in saving the information');
    }
  };

  const handlechange = (e) => {
    const { name, value } = e.target;
    setDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handlecopy = (text) => {
    window.navigator.clipboard.writeText(text);
    notify('copy');
  };

  const handledelete = (name) => {
    const data = JSON.parse(localStorage.getItem('links')) || {};
    if (data.hasOwnProperty(name)) {
      delete data[name];
      localStorage.setItem('links', JSON.stringify(data));
      setSavedlinks(data);
      notify('delete');
    }
  };

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('links')) || {};
    setSavedlinks(data);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").then((registration) => {
        console.log("Service worker registered", registration)
      }).catch((error) => {
        console.log("service worker registration failed", error)
      })
    }
    requestNotificationPermission();
    showNotification("We welcome you to Redlink");
    openDB().then(() => console.log("Database Initialized"))
  }, []);

  return (
    <div className="bg-black/95 min-h-screen text-gray-300 flex flex-col justify-between">

      {/* SEO Metadata */}
      <Helmet>
        <title>RedLink India - Save & Reuse Your Links Instantly</title>
        <meta name="description" content="Never lose a link again! RedLink India lets you save frequently used links and content for quick access." />
        <meta name="keywords" content="RedLink India, link saver, text saver, online clipboard, note organizer" />
        <meta name="author" content="Rohit Singh Panwar" />
      </Helmet>

      <div className="flex flex-col items-center text-5xl font-bold py-4">
        <h1 className="flex items-center">
          <span>Red</span><span className="text-red-600">Link</span>
        </h1>
        <p className="text-lg text-gray-300 text-center">Never lose a link again!</p>
      </div>

      <div className="flex flex-col lg:flex-row w-full justify-center items-center px-4 gap-5">
        <form onSubmit={handlesubmit} className="border-2 border-violet-600 bg-gray-900/80 rounded-xl flex flex-col p-5 m-2 w-full max-w-lg text-lg gap-4">
          <p className='font-bold italic'>Save & Reuse – Instantly Access Your Frequently Used Text & Links!</p>

          <label className="flex flex-col">Name
            <input type="text" onChange={handlechange} name="name" value={details.name} className="bg-violet-800 rounded-lg h-12 px-2" required placeholder="Enter the name of the text" />
          </label>

          <div className='flex items-center justify-between w-full'>
            <label className="flex flex-col w-[75%] sm:w-[80%] md:w-[80%] lg:w-[80%]">Link or Text
              <textarea onChange={handlechange} name="link" value={details.link} className="bg-violet-800 rounded-lg h-20 px-2 resize-none" required placeholder="Enter the Content..." />
            </label>

            {/* Toggle Button */}
            <div
              className=" w-18 lg:w-20 h-10 bg-white border rounded-full cursor-pointer relative flex items-center px-1 justify-between font-semibold text-black top-3"
              onClick={() => setIsToggled(!isToggled)}
            >
              <span className="text-xs md:text-sm px-1">Text</span>
              <span className="text-xs md:text-sm px-1">Link</span>
              <div
                className={`absolute top-1 h-8 w-8 bg-gray-400 rounded-full transition-all duration-500 ${isToggled ? "left-[calc(100%-2.4rem)] bg-violet-600" : "left-1"
                  }`}
              ></div>
            </div>
          </div>

          <button type="submit" className="border-white border text-white py-2 px-4 rounded-lg hover:bg-white hover:text-black transition">Save</button>
        </form>

        <ul className="w-full max-w-3xl h-[51vh] overflow-y-scroll border-2 border-violet-600 rounded-xl p-4 flex flex-col items-center gap-6 bg-gray-900/80 shadow-lg scrollbar-thin scrollbar-thumb-violet-500 scrollbar-track-gray-800">
  <h2 className="text-3xl font-bold italic text-white tracking-wide">Saved Links</h2>
  <div className="w-full max-w-3xl mb-4">
  <input
    type="text"
    placeholder="Search saved links or notes..."
    className="w-full px-4 py-2 rounded-xl border-2 border-white focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-900/80 text-white placeholder-gray-400"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
  />
</div>

  {Object.entries(savedlinks).length > 0 ? (
    Object.entries(savedlinks).filter(([key, value]) => {
      const valContent = typeof value === 'object' ? value.content : value;
      return key.toLowerCase().includes(searchQuery) || valContent.toLowerCase().includes(searchQuery);
    }).map(([key, value]) => (
      <li
        key={key}
        className="relative w-full flex flex-col md:flex-row md:gap-6 items-center justify-between p-4 bg-violet-900/90 rounded-xl shadow-md hover:bg-violet-800 transition-colors duration-200"
      >
        {/* Icon Placement */}
        <img
          src={
            (typeof value === "object" && value?.type === "link") ||
            (typeof value === "string" && value.startsWith("http"))
              ? linkIcon
              : textIcon
          }
          alt="Icon"
          className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 w-8 h-8 md:-left-2 md:top-1/2 md:-translate-y-1/2 md:translate-x-0 bg-violet-700 rounded-full p-1"
        />

        {/* Reminder Button */}
        <button
          className="border border-orange-400 p-1.5 rounded-lg text-sm italic text-orange-400 hover:bg-orange-400 hover:text-white transition-all duration-200 shadow shadow-orange-500/50"
          onClick={() => reminderClick(key)}
        >
          Add Reminder
        </button>

        {/* Reminder Modal */}
        {reminderForm === key && (
          <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-11/12 max-w-md text-center border border-gray-200">
              <h1 className="underline font-semibold text-xl text-red-600 mb-4">Reminder For {key}</h1>

              {/* Date & Time Input */}
              <label className="block mt-4 text-sm font-medium text-gray-800">
                Enter Date & Time
                <input
                  type="datetime-local"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                />
              </label>

              {/* Title Input */}
              <label className="block mt-4 text-sm font-medium text-gray-800">
                Enter Title
                <input
                  type="text"
                  placeholder="e.g. Sale starts in..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="block w-full border border-gray-300 rounded-lg p-2.5 mt-1 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                />
              </label>

              {/* Buttons */}
              <div className="flex justify-center gap-6 mt-6">
                <button
                  onClick={handleSetReminder}
                  className="bg-red-600 text-white py-2.5 px-6 rounded-lg shadow-md hover:bg-red-700 transition-all duration-200"
                >
                  Set Reminder
                </button>
                <button
                  onClick={handleReminderCancel}
                  className="bg-gray-500 text-white py-2.5 px-6 rounded-lg shadow-md hover:bg-gray-600 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Key Display */}
        <strong className="text-center text-white font-semibold">{key}</strong>

        {/* Link or Text Content */}
        {typeof value === "object" && value !== null ? (
          value.type === "link" ? (
            <a
              href={value.content}
              className="break-all text-blue-300 underline lg:w-[80%] text-center hover:text-blue-400 transition-colors duration-150"
              target="_blank"
              rel="noopener noreferrer"
            >
              {value.content}
            </a>
          ) : (
            <span className="break-all lg:w-[70%] text-center text-gray-200">{value.content}</span>
          )
        ) : value.startsWith("http") ? (
          <a
            href={value}
            className="break-all text-blue-300 underline lg:w-[80%] text-center hover:text-blue-400 transition-colors duration-150"
            target="_blank"
            rel="noopener noreferrer"
          >
            {value}
          </a>
        ) : (
          <span className="break-all text-center lg:w-[70%] md:text-left lg:text-center text-gray-200">
            {value}
          </span>
        )}

        {/* Action Icons */}
        <div className="flex gap-3">
          <img
            src={copyIcon}
            alt="Copy"
            className="invert w-7 h-7 cursor-pointer hover:opacity-80 transition-opacity duration-150"
            onClick={() => handlecopy(value?.content || value)}
          />
          <img
            src={deleteIcon}
            alt="Delete"
            className="w-7 h-7 invert cursor-pointer hover:opacity-80 transition-opacity duration-150"
            onClick={() => handledelete(key)}
          />
        </div>
      </li>
    ))
  ) : (
    <p className="font-bold italic text-xl text-gray-300">Hey there, Nothing Saved Yet! 🤓</p>
  )}
</ul>
      </div>

      <footer className="bg-black/95 border-t shadow rounded-t-2xl shadow-white flex flex-col items-center p-5 w-full text-sm md:text-lg lg:mt-auto mt-3 ">
        <h1 className="flex items-center text-2xl font-bold ">
          <span>Red</span><span className="text-red-600">Link</span>
        </h1>
        <p className="text-center">Say goodbye to repetitive typing! Instantly save and access your go-to links and texts with ease. </p>
        <span className="mt-2 flex justify-center gap-5 w-full items-center font-semibold">© 2025 Rohit Singh Panwar.
          <a href="https://github.com/rohitsinghpanwar/redlink"><img src={githubIcon} alt="github" className='invert h-6 w-6' loading="lazy" /></a>
        </span>
      </footer>

      <ToastContainer position="top-right" theme='dark' autoClose={2000} hideProgressBar={false} />
    </div>
  );
}

export default App;
