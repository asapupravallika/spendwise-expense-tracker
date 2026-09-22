import React,{useEffect,useMemo,useState} from "react";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  WalletCards,
  CreditCard,
  TrendingUp
} from "lucide-react";

import {authApiClient,oauthBase,unwrap} from "../api";
import {setUser} from "../App";
import {
  ErrorBox,
  Field,
  SuccessBox,
  WingedMoneyLogo
} from "../components";

const slides=[
  {
    image:"https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1100&q=85",
    icon:WalletCards,
    title:"Turn spending into a plan.",
    text:"See your money clearly and make every rupee count."
  },
  {
    image:"https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1100&q=85",
    icon:BarChart3,
    title:"Make smarter money moves.",
    text:"Track income, expenses, budgets and goals from one calm workspace."
  },
  {
    image:"https://images.unsplash.com/photo-1565514020179-026b92b84bb6?auto=format&fit=crop&w=1100&q=85",
    icon:Target,
    title:"Save for what matters.",
    text:"Build goals, watch progress and stay intentional with your finances."
  },
  {
    image:"https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1100&q=85",
    icon:CreditCard,
    title:"Your financial pulse, at a glance.",
    text:"A beautiful dashboard that keeps your next decision close."
  }
];

function PasswordField({
  label,
  value,
  onChange,
  placeholder="Enter password",
  required=true
}){
  const [show,setShow]=useState(false);

  return (
    <Field label={label} required={required}>
      <div className="password-wrap">
        <LockKeyhole size={16}/>

        <input
          required={required}
          type={show?"text":"password"}
          minLength={8}
          value={value}
          onChange={e=>onChange(e.target.value)}
          placeholder={placeholder}
        />

        <button
          type="button"
          className="password-toggle"
          onClick={()=>setShow(!show)}
        >
          {show
            ? <EyeOff size={16}/>
            : <Eye size={16}/>
          }
        </button>
      </div>
    </Field>
  );
}

function Carousel(){
  const [i,setI]=useState(0);

  useEffect(()=>{
    const id=setInterval(
      ()=>setI(x=>(x+1)%slides.length),
      4500
    );

    return()=>clearInterval(id);
  },[]);

  const s=slides[i];

  return (
    <div
      className="auth-visual"
      style={{
        backgroundImage:
          `linear-gradient(180deg,#062f2bcc,#062f2c66 48%,#06221fe6),url(${s.image})`
      }}
    >
      <div className="visual-top">

        <button
          type="button"
          className="visual-brand brand-link"
          onClick={()=>window.location.href="/"}
          aria-label="Go to SpendWise home"
        >
          <div className="brand-mark winged-logo-mark">
            <WingedMoneyLogo size={44}/>
          </div>

          <div>
            <b>SpendWise</b>
            <span>Personal finance, beautifully simple.</span>
          </div>
        </button>

        <span className="live-pill">
          <span/>
          Secure workspace
        </span>

      </div>

      <div className="visual-copy">

        <div className="big-emoji">
          <s.icon size={44}/>
        </div>

        <span className="eyebrow light">
          MONEY, MADE CLEAR
        </span>

        <h2>{s.title}</h2>

        <p>{s.text}</p>

        <div className="carousel-dots">
          {slides.map((_,n)=>
            <button
              aria-label={`Slide ${n+1}`}
              className={n===i?"active":""}
              onClick={()=>setI(n)}
              key={n}
            />
          )}
        </div>

      </div>

      <div className="floating-stat">
        <Sparkles size={16}/>

        <div>
          <b>Financial confidence</b>

          <small>
            One decision at a time
            <Sparkles size={11}/>
          </small>
        </div>
      </div>

    </div>
  );
}

export default function Auth({mode="login"}){

  const [form,setForm]=useState({
    name:"",
    email:"",
    phone:"",
    password:"",
    confirm:"",
    role:"USER",
    adminCode:""
  });

  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState("");

  const isRegister=mode==="register";

  const submit=async e=>{
    e.preventDefault();

    setError("");
    setSuccess("");

    if(
      isRegister &&
      form.password!==form.confirm
    ){
      setError("Passwords do not match.");
      return;
    }

    if(
      isRegister &&
      form.role==="ADMIN" &&
      !form.adminCode.trim()
    ){
      setError("Admin registration code is required.");
      return;
    }

    setLoading(true);

    try{

      if(isRegister){

        const result=unwrap(
          await authApiClient.register(
            {
              name:form.name,
              email:form.email,
              phone:form.phone,
              password:form.password,
              role:form.role
            },
            {
              headers:{
                "X-Admin-Code":form.adminCode
              }
            }
          )
        );

        await finishLogin(result);

      }else{

        const result=unwrap(
          await authApiClient.login({
            email:form.email,
            password:form.password
          })
        );

        await finishLogin(result);
      }

    }catch(e){

      setError(e.message);

    }finally{

      setLoading(false);

    }
  };

  const finishLogin=async result=>{

    localStorage.setItem(
      "spendwise_token",
      result.token
    );

    const authUser=result.user||{};

    const user={
      userId:authUser.profileId,
      authUserId:
        result.authUserId||
        authUser.authUserId,
      name:authUser.name,
      email:authUser.email,
      phone:authUser.phone||"",
      role:authUser.role||"USER",
      provider:authUser.provider||"LOCAL"
    };

    if(!user.userId){

      throw new Error(
        "Your financial profile was not created. Check the backend logs."
      );

    }

    setUser(user);

    window.dispatchEvent(
      new Event("expense-user-changed")
    );

    window.location.href="/";
  };

  const social=provider=>{
    window.location.href=
      `${oauthBase}/oauth2/authorization/${provider}`;
  };

  return (
    <div className="auth-page">

      <div className="auth-frame">

        <Carousel/>

        <section className="auth-form-panel">

          <button
            className="auth-back"
            onClick={()=>window.location.href="/welcome"}
          >
            <ChevronLeft size={16}/>
            SpendWise
          </button>

          <div className="auth-form-inner">

            <button
              type="button"
              className="mobile-auth-logo brand-link"
              onClick={()=>window.location.href="/"}
            >
              <div className="brand-mark winged-logo-mark">
                <WingedMoneyLogo size={40}/>
              </div>

              <b>SpendWise</b>
            </button>

            <span className="eyebrow">
              {isRegister
                ? "CREATE YOUR SPACE"
                : "WELCOME BACK"
              }
            </span>

            <h1>
              {isRegister
                ?
                <>
                  Build better money habits.
                  <span className="inline-title-icon">✨</span>
                </>
                :
                <>
                  Good to see you again.
                  <span className="inline-title-icon">👋</span>
                </>
              }
            </h1>

            <p className="auth-subtitle">
              {isRegister
                ? "Create your account and start making your money work with you."
                : "Sign in to see your financial pulse and keep your next move intentional."
              }
            </p>

            <div className="social-row">

              <button
                type="button"
                className="social-btn google"
                onClick={()=>social("google")}
              >
                <span className="google-g">G</span>
                Continue with Google
              </button>

            </div>

            <div className="divider">
              <span>or continue with email</span>
            </div>

            <form onSubmit={submit}>

              {isRegister &&
                <div className="auth-two">

                  <Field
                    label="Full name"
                    required
                  >
                    <div className="input-icon">

                      <UserRound size={16}/>

                      <input
                        required
                        maxLength="100"
                        value={form.name}
                        onChange={e=>
                          setForm({
                            ...form,
                            name:e.target.value
                          })
                        }
                        placeholder="Enter your name"
                      />

                    </div>
                  </Field>

                  <Field label="Phone">

                    <div className="input-icon">

                      <Phone size={16}/>

                      <input
                        maxLength="20"
                        value={form.phone}
                        onChange={e=>
                          setForm({
                            ...form,
                            phone:e.target.value
                          })
                        }
                        placeholder="Enter phone number"
                      />

                    </div>

                  </Field>

                </div>
              }

              <Field
                label="Email address"
                required
              >

                <div className="input-icon">

                  <Mail size={16}/>

                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={e=>
                      setForm({
                        ...form,
                        email:e.target.value
                      })
                    }
                    placeholder="you@example.com"
                  />

                </div>

              </Field>

              <PasswordField
                label="Password"
                value={form.password}
                onChange={v=>
                  setForm({
                    ...form,
                    password:v
                  })
                }
              />

              {isRegister &&
                <>
                  <PasswordField
                    label="Confirm password"
                    value={form.confirm}
                    onChange={v=>
                      setForm({
                        ...form,
                        confirm:v
                      })
                    }
                  />

                  <Field
                    label="Account role"
                    required
                  >

                    <select
                      value={form.role}
                      onChange={e=>
                        setForm({
                          ...form,
                          role:e.target.value
                        })
                      }
                    >
                      <option value="USER">
                        User
                      </option>

                      <option value="ADMIN">
                        Administrator
                      </option>
                    </select>

                  </Field>

                  {form.role==="ADMIN" &&
                    <Field
                      label="Admin registration code"
                      required
                    >

                      <div className="input-icon">

                        <ShieldCheck size={16}/>

                        <input
                          required
                          value={form.adminCode}
                          onChange={e=>
                            setForm({
                              ...form,
                              adminCode:e.target.value
                            })
                          }
                          placeholder="Enter admin code"
                        />

                      </div>

                    </Field>
                  }

                  <div className="password-hint">

                    <ShieldCheck size={15}/>

                    Use at least 8 characters for a stronger password.

                  </div>

                </>
              }

              <ErrorBox message={error}/>

              <SuccessBox message={success}/>

              <button
                className="primary-btn auth-submit"
                disabled={loading}
              >

                {loading
                  ? (
                      isRegister
                        ? "Creating account…"
                        : "Signing you in…"
                    )
                  : (
                      isRegister
                        ? "Create account"
                        : "Sign in"
                    )
                }

                <ArrowRight size={17}/>

              </button>

            </form>

            <div className="auth-switch">

              {isRegister
                ?
                <>
                  Already have an account?

                  <button
                    onClick={()=>
                      window.location.href="/login"
                    }
                  >
                    Sign in
                  </button>
                </>
                :
                <>
                  New to SpendWise?

                  <button
                    onClick={()=>
                      window.location.href="/register"
                    }
                  >
                    Create an account
                  </button>
                </>
              }

            </div>

            <div className="secure-note">

              <CheckCircle2 size={15}/>

              Your password is securely hashed on the backend.

            </div>

          </div>

        </section>

      </div>

    </div>
  );
}