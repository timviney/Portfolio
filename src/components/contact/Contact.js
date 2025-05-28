import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import Title from '../layouts/Title';
import ContactLeft from './ContactLeft';

const Contact = () => {
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const emailValidation = () => {
    return String(email)
      .toLowerCase()
      .match(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/);
    };
  
  const phoneValidation = () => {
    // Basic phone validation - allows various formats
    return String(phoneNumber)
      .replace(/\s/g, '') // Remove spaces
      .match(/^[+]?[0-9][\d]{0,15}$/); // Basic international format
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setErrMsg("");
    setSuccessMsg("");
    
    // Validation
    if (username === "") {
      setErrMsg("Name is required!");
      return;
    } else if (email === "") {
      setErrMsg("Please give your Email!");
      return;
    } else if (!emailValidation()) {
      setErrMsg("Please give a valid Email!");
      return;
    } else if (phoneNumber !== "" && !phoneValidation()) {
      setErrMsg("Please provide a valid phone number!");
      return;
    } else if (subject === "") {
      setErrMsg("Please provide a Subject!");
      return;
    } else if (message === "") {
      setErrMsg("Message is required!");
      return;
    }

    // Start loading
    setIsLoading(true);

    try {
      // EmailJS configuration
      const serviceId = 'service_phz70zy';
      const templateId = 'template_v9z7i2a';
      const publicKey = 'TNUeWI9fw864rC7I-';

      const templateParams = {
        from_name: username,
        from_email: email,
        phone_number: phoneNumber || 'Not provided',
        subject: subject,
        message: message,
        to_name: 'Tim Viney',
      };

      const result = await emailjs.send(serviceId, templateId, templateParams, publicKey);
      
      if (result.status === 200) {
        setSuccessMsg(
          `Thank you ${username}, your message has been sent successfully!`
        );

        // Clear form after successful submission
        setUsername("");
        setPhoneNumber("");
        setEmail("");
        setSubject("");
        setMessage("");
      }
    } catch (error) {
      console.error('Email sending failed:', error);
      setErrMsg("Failed to send message. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="w-full py-20 border-b-[1px] border-b-black"
    >
      <div className="flex justify-center items-center text-center">
        <Title title="CONTACT" des="Contact Me" />
      </div>
      <div className="w-full">
        <div className="w-full h-auto flex flex-col lgl:flex-row justify-between">
          <ContactLeft />
          <div className="w-full lgl:w-[60%] h-full py-10 bg-gradient-to-r from-[#1e2024] to-[#23272b] flex flex-col gap-8 p-4 lgl:p-8 rounded-lg shadow-shadowOne">
            <form className="w-full flex flex-col gap-4 lgl:gap-6 py-2 lgl:py-5">
              {errMsg && (
                <p className="py-3 bg-gradient-to-r from-[#1e2024] to-[#23272b] shadow-shadowOne text-center text-orange-500 text-base tracking-wide animate-bounce">
                  {errMsg}
                </p>
              )}
              {successMsg && (
                <p className="py-3 bg-gradient-to-r from-[#1e2024] to-[#23272b] shadow-shadowOne text-center text-green-500 text-base tracking-wide animate-bounce">
                  {successMsg}
                </p>
              )}
              <div className="w-full flex flex-col lgl:flex-row gap-10">
                <div className="w-full lgl:w-1/2 flex flex-col gap-4">
                  <p className="text-sm text-gray-400 uppercase tracking-wide">
                    Your name
                  </p>
                  <input
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                    className={`${
                      errMsg === "Name is required!" &&
                      "outline-designColor"
                    } contactInput`}
                    type="text"
                    placeholder="Enter your name"
                  />
                </div>
                <div className="w-full lgl:w-1/2 flex flex-col gap-4">
                  <p className="text-sm text-gray-400 uppercase tracking-wide">
                    Phone Number <span className="text-xs normal-case">(optional)</span>
                  </p>
                  <input
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    value={phoneNumber}
                    className={`${
                      errMsg === "Please provide a valid phone number!" &&
                      "outline-designColor"
                    } contactInput`}
                    type="tel"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-400 uppercase tracking-wide">
                  Email
                </p>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  className={`${
                    (errMsg === "Please give your Email!" || errMsg === "Please give a valid Email!") &&
                    "outline-designColor"
                  } contactInput`}
                  type="email"
                  placeholder="Enter your email"
                />
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-400 uppercase tracking-wide">
                  Subject
                </p>
                <input
                  onChange={(e) => setSubject(e.target.value)}
                  value={subject}
                  className={`${
                    errMsg === "Please provide a Subject!" &&
                    "outline-designColor"
                  } contactInput`}
                  type="text"
                  placeholder="Enter the subject"
                />
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-sm text-gray-400 uppercase tracking-wide">
                  Message
                </p>
                <textarea
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                  className={`${
                    errMsg === "Message is required!" && "outline-designColor"
                  } contactTextArea`}
                  cols="30"
                  rows="8"
                  placeholder="Enter your message"
                ></textarea>
              </div>
              <div className="w-full">
                <button
                  onClick={handleSend}
                  disabled={isLoading}
                  className={`w-full h-12 bg-[#141518] rounded-lg text-base text-gray-400 tracking-wider uppercase hover:text-white duration-300 hover:border-[1px] hover:border-designColor border-transparent ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
              {errMsg && (
                <p className="py-3 bg-gradient-to-r from-[#1e2024] to-[#23272b] shadow-shadowOne text-center text-orange-500 text-base tracking-wide animate-bounce">
                  {errMsg}
                </p>
              )}
              {successMsg && (
                <p className="py-3 bg-gradient-to-r from-[#1e2024] to-[#23272b] shadow-shadowOne text-center text-green-500 text-base tracking-wide animate-bounce">
                  {successMsg}
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;