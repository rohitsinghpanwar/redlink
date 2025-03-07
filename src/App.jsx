import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import deleteIcon from './assets/delete.png';
import copyIcon from './assets/copy.png';
import githubIcon from './assets/github-sign.png';
function App() {
  const [details, setDetails] = useState({ name: '', link: '' });
  const [savedlinks, setSavedlinks] = useState(() => JSON.parse(localStorage.getItem('links')) || {});

  const notify = (type) => {
    if (type === 'save') toast.success('Saved Successfully');
    if (type === 'copy') toast('Copied Successfully');
    if (type === 'delete') toast.error('Deleted Successfully');
  };

  const handlesubmit = (e) => {
    e.preventDefault();
    try {
      const prevData = JSON.parse(localStorage.getItem('links')) || {};
      const updateddata = { ...prevData, [details.name]: details.link };
      localStorage.setItem('links', JSON.stringify(updateddata));
      notify('save');
      setSavedlinks(updateddata);
      setDetails({ name: '', link: '' });
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
  }, []);

  return (
    <div className="bg-black/95 min-h-screen text-gray-300 flex flex-col justify-between">
      <div className="flex flex-col items-center justify-center text-5xl font-bold py-4">
        <h1 className="flex items-center">
          <span>Red</span><span className="text-red-600">Link</span>
        </h1>
        <p className="text-lg text-gray-300">Never lose a link again!</p>
      </div>

      <div className="flex flex-col md:flex-row w-full justify-center items-center px-4">
        <form onSubmit={handlesubmit} className="border-2 border-red-600 rounded-xl flex flex-col p-5 m-2 w-full md:w-[40vw] text-xl gap-4 h-[50vh]">
          <p className='font-bold'>Save & Reuse – Instantly Access Your Frequently Used Text & Links!</p>
          <label className="flex flex-col w-full">Name
            <input type="text" onChange={handlechange} name="name" value={details.name} className="bg-violet-800 rounded-lg h-12 w-full px-2" required placeholder="Enter the name of the text" />
          </label>
          <label className="flex flex-col w-full">Link or Text
            <textarea onChange={handlechange} name="link" value={details.link} className="bg-violet-800 rounded-lg h-20 w-full px-2 resize-none" required placeholder="Enter the Content..." />
          </label>
          <button type="submit" className="border-white border text-white py-2 px-4 rounded-lg hover:bg-white/50 transition">Save</button>
        </form>

        <ul className="w-full md:w-[40vw] h-[50vh] overflow-y-scroll border-2 border-red-600 rounded-xl p-2 m-2 flex flex-col items-center gap-2 md:text-lg">
          <h2 className="text-2xl font-bold">Saved Links</h2>
          {Object.entries(savedlinks).length > 0 ? (
            Object.entries(savedlinks).map(([key, value]) => (
              <li key={key} className="border w-full flex flex-col md:flex-row items-center justify-between p-1 bg-violet-800 transition-all ease-in-out duration-500 rounded-xl hover:shadow-sm shadow-white md:p-2 ">
                <strong className="text-center md:text-left">{key}</strong>
                <h1 className="break-all text-center md:text-left">{value}</h1>
                <div className="flex gap-2 mt-2 md:mt-0">
                  <img src={copyIcon} alt="Copy" className="invert w-6 h-6  cursor-pointer" onClick={() => handlecopy(value)} />
                  <img src={deleteIcon} alt="Delete" className="w-6 h-6  invert cursor-pointer" onClick={() => handledelete(key)} />
                </div>
              </li>
            ))
          ) : (
            <p>No Links Saved Yet!</p>
          )}
        </ul>
      </div>

      <footer className="bg-black/95 border-t shadow rounded-t-2xl shadow-white flex flex-col items-center p-5 w-full mt-auto text-sm md:text-lg">
        <h1 className="flex items-center text-2xl font-bold">
          <span>Red</span><span className="text-red-600">Link</span>
        </h1>
        <p className="md:text-center">Tired of typing the same text over and over? RedLink lets you save frequently used links and content for quick access.
          <br />
          No backend, No data tracking - everything is stored in your browser’s local storage and can be deleted anytime with a single click. Stay organized and Never lose a link again !</p>
        <ul className=" hidden flex-col items-center mt-2  md:flex">
          <li>"Why should we hire you?" – Your go-to job interview answer</li>
          <li>GitHub, LinkedIn, and social links – Share them in one click</li>
        </ul>
        <span className="mt-2 flex justify-center gap-5 w-full  items-center font-semibold">Copyright 2025 @ Rohit Singh Panwar
          <a href="https://github.com/rohitsinghpanwar/redlink"><img src={githubIcon} alt="github" className='invert h-6 w-6 ' /></a></span>

      </footer>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnHover
        draggable
        theme="dark"
      />
    </div>
  );
}

export default App;
