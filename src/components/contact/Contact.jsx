import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import Title from "../layouts/Title";
import ContactLeft from "./ContactLeft";

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
    return String(phoneNumber)
      .replace(/\s/g, "")
      .match(/^[+]?[0-9][\d]{0,15}$/);
  };

  const handleSend = async (e) => {
    e.preventDefault();

    setErrMsg("");
    setSuccessMsg("");

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

    setIsLoading(true);

    try {
      const serviceId = "service_phz70zy";
      const templateId = "template_v9z7i2a";
      const publicKey = "TNUeWI9fw864rC7I-";

      const templateParams = {
        from_name: username,
        from_email: email,
        phone_number: phoneNumber || "Not provided",
        subject: subject,
        message: message,
        to_name: "Tim Viney",
      };

      const result = await emailjs.send(serviceId, templateId, templateParams, publicKey);

      if (result.status === 200) {
        setSuccessMsg(`Thank you ${username}, your message has been sent successfully!`);

        setUsername("");
        setPhoneNumber("");
        setEmail("");
        setSubject("");
        setMessage("");
      }
    } catch (error) {
      console.error("Email sending failed:", error);
      setErrMsg("Failed to send message. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fieldError = (...messages) => messages.includes(errMsg);

  return (
    <section id="contact" className="w-full py-20 md:py-24">
      <div className="mx-auto max-w-screen-xl px-4 md:px-8">
        <Title number="05" title="CONTACT" des="Contact Me" />

        <div className="flex w-full flex-col justify-between gap-10 lgl:flex-row">
          <ContactLeft />

          <form
            onSubmit={handleSend}
            className="card-dark fade-swap h-full w-full flex-col gap-8 rounded-lg p-6 shadow-shadowOne lgl:w-[62%] lgl:p-8"
          >
            {errMsg && (
              <p className="fade-swap border-l-4 border-accent bg-panel py-3 text-center font-mono text-xs uppercase tracking-wide text-accent">
                {errMsg}
              </p>
            )}
            {successMsg && (
              <p className="fade-swap border-l-4 border-good bg-panel py-3 text-center font-mono text-xs uppercase tracking-wide text-good">
                {successMsg}
              </p>
            )}

            <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="contact-name" className="label-dark">
                  Your name
                </label>
                <input
                  id="contact-name"
                  onChange={(e) => setUsername(e.target.value)}
                  value={username}
                  className={`input-dark ${fieldError("Name is required!") ? "border-accent" : ""}`}
                  type="text"
                  placeholder="Enter your name"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="contact-phone" className="label-dark">
                  Phone Number <span className="normal-case">(optional)</span>
                </label>
                <input
                  id="contact-phone"
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  value={phoneNumber}
                  className={`input-dark ${fieldError("Please provide a valid phone number!") ? "border-accent" : ""}`}
                  type="tel"
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="contact-email" className="label-dark">
                  Email
                </label>
                <input
                  id="contact-email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  className={`input-dark ${fieldError("Please give your Email!", "Please give a valid Email!") ? "border-accent" : ""}`}
                  type="email"
                  placeholder="Enter your email"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="contact-subject" className="label-dark">
                  Subject
                </label>
                <input
                  id="contact-subject"
                  onChange={(e) => setSubject(e.target.value)}
                  value={subject}
                  className={`input-dark ${fieldError("Please provide a Subject!") ? "border-accent" : ""}`}
                  type="text"
                  placeholder="Enter the subject"
                />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label htmlFor="contact-message" className="label-dark">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  onChange={(e) => setMessage(e.target.value)}
                  value={message}
                  className={`input-dark resize-none ${fieldError("Message is required!") ? "border-accent" : ""}`}
                  cols="30"
                  rows="7"
                  placeholder="Enter your message"
                ></textarea>
              </div>
            </div>

            <div className="mt-2 w-full">
              <button type="submit" disabled={isLoading} className="btn-solid w-full h-12">
                {isLoading ? "Sending..." : "Send Message"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;
