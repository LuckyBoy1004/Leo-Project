import React, { useRef, useState, useEffect, useReducer } from 'react'
import { useAuth } from '../context/userContext'

import Title from './utilities/Title'

import { ButtonSmall } from '../components/utilities/Buttons'
import { CSSTransition } from 'react-transition-group';
import {Button, DatePicker} from 'antd';
import moment from "moment";
import ReactLoading from "react-loading";
import 'antd/dist/antd.css'


const Prest_Dashboard_Sponsorship = () => {

    const {
        seller,
        setSeller,
        saveHoliday,
        getSellerReferralCountFromDB
    } = useAuth()
    const isMobile = () =>  windowsWidth < 1100
    const [buttonLoading, setButtonLoading] = useState(false);

    const [calendar_divs, setCalendar_divs] = useState(loading_get_month());

    const [year, setYear] = useState(moment()._d.getFullYear())
    const [month, setMonth] = useState(moment()._d.getUTCMonth())
    const [windowsWidth, setWindowsWidth] = useState(window.innerWidth)
    const handleResize = (width) => setWindowsWidth(width)

    const [allDays, setAllDays] = useState(new Date(moment()._d.getFullYear(), moment()._d.getUTCMonth()+1, 0).getDate())
    const [beforeDays, setBeforeDays] = useState(new Date(moment()._d.getFullYear(), moment()._d.getUTCMonth(), 0).getDate())
    const [startDay, setStartDay] = useState(new Date(moment()._d.getFullYear() + "-" + moment()._d.getUTCMonth() + "-01").getDay())

    // const [isLinkCopied, setIsLinkCopied] = useState(false)

    const [isMounted, setIsMounted] = useState(false);

    const initialState = {
        click: false,
        change: false
    };
    const dayState = {
        open_shop: true,
    };
    const reducer = (state, action) => ({ ...state, ...action });

    const [state, setState] = useReducer(reducer, initialState);

    const [day_state, setDay_state] = useReducer(reducer, dayState);

    const [referralCount, setReferralCount] = useState(0)

    const Checkbox = ({ fnClick, fnChange, title = "", checked = false }) => (
        <label>
          <input
          className='check_box'
            onClick={e => {
              if (fnClick !== undefined) fnClick(e.target.checked);
            }}
            onChange={e => {
              if (fnChange !== undefined) fnChange(e.target.checked);
            }}
            type="checkbox"
            checked={checked}
          />
          <p className='viewp'>{title}</p>
        </label>
    );

    useEffect(() => {
        window.addEventListener("resize", (e) => handleResize(window.innerWidth))
        getSellerReferralCountFromDB().then(count => {
            setReferralCount(count)
        })
        return setIsMounted(true)
    }, [])

    function loading_get_month() {
        var holiday_data = seller.holiday
        var all_Days = new Date(moment()._d.getFullYear(), moment()._d.getUTCMonth()+1, 0).getDate()
        var start_day = new Date(moment()._d.getFullYear() , moment()._d.getUTCMonth() , 0).getDay()
        var before_days = new Date(moment()._d.getFullYear() , moment()._d.getUTCMonth() , 0).getDate()
        var div_array = [];
        for (let i = (start_day+6)%7; i >= 0; i--) {
            div_array.push({time: 'before', day: before_days-i, state: 'grey', check: false})
        }
        for (let i = 0; i < all_Days; i++) {
            if (holiday_data!=undefined) {
                for (let j = 0; j < holiday_data.length; j++) {
                    if (holiday_data[j] == (moment()._d.getFullYear()+'.'+(moment()._d.getUTCMonth()+1)+'.'+(i+1))) {
                        div_array.push({time: 'now', day: i+1, state: 'red', check: false})
                        continue;
                    }
                }
            }
            if (div_array[div_array.length-1].day != i+1) {
                div_array.push({time: 'now', day: i+1, state: 'green', check: false})
            }
        }
        var next_limit = div_array.length
        for (let i = 0; i < 7-(next_limit%7); i++) {
            div_array.push({time: 'next', day: i+1, state: 'grey', check: false})
        }
        return div_array;
    }

    function get_month(date) {
        setYear(date._d.getFullYear())
        setMonth(date._d.getUTCMonth())
        setAllDays(new Date(date._d.getFullYear(), date._d.getUTCMonth()+1, 0).getDate())
        setStartDay(new Date(date._d.getFullYear(), date._d.getUTCMonth(), 0).getDay())
        setBeforeDays(new Date(date._d.getFullYear(), date._d.getUTCMonth(), 0).getDate())
        var holiday_data = seller.holiday
        var all_Days = new Date(date._d.getFullYear(), date._d.getUTCMonth()+1, 0).getDate()
        var start_day = new Date(date._d.getFullYear() , date._d.getUTCMonth() , 0).getDay()
        var before_days = new Date(date._d.getFullYear() , date._d.getUTCMonth() , 0).getDate()
        var div_array = [];
        let number = (start_day+7)%7;
        console.log(number)
        for (let i = number; i > 0; i--) {
            div_array.push({time: 'before', day: before_days-i, state: 'grey', check: false})
        }
        for (let i = 0; i < all_Days; i++) {
            for (let j = 0; j < holiday_data.length; j++) {
                if (holiday_data[j] == (date._d.getFullYear()+'.'+(date._d.getUTCMonth()+1)+'.'+(i+1))) {
                    div_array.push({time: 'now', day: i+1, state: 'red', check: false})
                    continue;
                }
            }
            if (div_array.length) {
                if (div_array[div_array.length-1].day != i+1) {
                    div_array.push({time: 'now', day: i+1, state: 'green', check: false})
                }
            }else {
                div_array.push({time: 'now', day: i+1, state: 'green', check: false})
            }

        }
        var next_limit = div_array.length
        for (let i = 0; i < 7-(next_limit%7); i++) {
            div_array.push({time: 'next', day: i+1, state: 'grey', check: false})
        }
        setCalendar_divs(div_array)
    }

    function click_day(e) {
        const update_array = [];
        switch (e.nativeEvent.path[1].className) {
            case 'calendar_cell_red':
                for (let i = 0; i < calendar_divs.length; i++) {
                    update_array.push(calendar_divs[i]);
                    if (i==e.nativeEvent.path[1].dataset.tab && update_array[i].check == false) {
                        update_array[i].state = 'green';
                    }
                }
                setCalendar_divs(update_array)
                break;
        
            case 'calendar_cell_green':
                for (let i = 0; i < calendar_divs.length; i++) {
                    update_array.push(calendar_divs[i]);
                    if (i==e.nativeEvent.path[1].dataset.tab) {
                        update_array[i].state = 'red';
                    }
                }
                setCalendar_divs(update_array)
                break;
        
            
            case 'calendar_cell_mobile_red':
                for (let i = 0; i < calendar_divs.length; i++) {
                    update_array.push(calendar_divs[i]);
                    if (i==e.nativeEvent.path[1].dataset.tab && update_array[i].check == false) {
                        update_array[i].state = 'green';
                    }
                }
                setCalendar_divs(update_array)
                break;
        
            case 'calendar_cell_mobile_green':
                for (let i = 0; i < calendar_divs.length; i++) {
                    update_array.push(calendar_divs[i]);
                    if (i==e.nativeEvent.path[1].dataset.tab) {
                        update_array[i].state = 'red';
                    }
                }
                setCalendar_divs(update_array)
                break;
        
            case 'calendar_cell_grey':
                
                break;
        }
    }

    function check_day(e, check) {
        const update_array = [];
        for (let i = 0; i < calendar_divs.length; i++) {
            update_array.push(calendar_divs[i]);
            if (i%7==check&&update_array[i].time == 'now') {
                if (e) {
                    update_array[i].check = true;
                    update_array[i].state = 'red';
                }else {
                    update_array[i].check = false;
                    update_array[i].state = 'green';
                }
            }
        }
        switch (check) {
            case 0:
                setState({'Lundi':e})
                break;
        
            case 1:
                setState({'Mondi':e})
                break;
        
            case 2:
                setState({'Mercredi':e})
                break;
        
            case 3:
                setState({'Jeudi':e})
                break;
        
            case 4:
                setState({'Vendredi':e})
                break;
        
            case 5:
                setState({'Samedi':e})
                break;
        
            case 6:
                setState({'Demanche':e})
                break;
        
        }
        setCalendar_divs(update_array)
    }

    function GetHoliday() {
        setButtonLoading(true);
        var save_db = [];
        var before = 0;
        for (let i = 0; i < calendar_divs.length; i++) {
            if (calendar_divs[i].state == 'grey') {
                before++;
            }
            if (calendar_divs[i].state == 'red') {
                let string = year + '.' + (month+1) + '.' + (i+1-before);
                save_db.push(string)
            }
        }
        var UD_Info = seller
        if (UD_Info.holiday!=undefined) {
            for (let i = 0; i < UD_Info.holiday.length; i++) {
                var monthArray = UD_Info.holiday[i].split('.');
                if (monthArray[0] == year && monthArray[1] == month+1) {
                    UD_Info.holiday.splice(i,1);
                    i--;
                }
            }
            UD_Info.holiday = UD_Info.holiday.concat(save_db)
        }else {
            UD_Info.holiday = save_db;
        }
        setSeller(UD_Info)
        saveHoliday(seller.uid, save_db, year, month+1).then((res) => {
            if(res){
                setTimeout(() => {
                    setButtonLoading(false);
                }, 1000);
            }
          });
    }
    return (
        <CSSTransition
            in={isMounted}
            timeout={300}
            classNames="pageTransition"
            unmountOnExit
        >
            <div className="prest_Dashboard_Sponsorship">
                <div className="prest_dashboard_sponsorship_header calendar_header">
                    <div className="sponsorship_header_content">
                        <Title value="Calendrier de disponibilités" type="h2" font="roboto-medium" align="left" />
                    </div>
                </div>
                <div className='select_month'>Mois sélectionné</div>
                <DatePicker
                    picker="month"
                    dateFormat="MM.YYYY"
                    format="MMMM YYYY"
                    style={{width: "280px"}}
                    defaultValue={moment()}
                    size="large"
                    onChange={(date) => {
                        get_month(date);
                    }}
                    placeholderText="Select month"
                />
                    <div className='total_calendar'>
                        {!isMobile() ? 
                            <div className='calendar_view'>
                                <div className='week_value'>Lundi</div>
                                <div className='week_value'>Mondi</div>
                                <div className='week_value'>Mercredi</div>
                                <div className='week_value'>Jeudi</div>
                                <div className='week_value'>Vendredi</div>
                                <div className='week_value'>Samedi</div>
                                <div className='week_value'>Demanche</div>
                                {
                                    calendar_divs.map((value, index) => {
                                        return (
                                            <div key={index} className={`calendar_cell_${value.state}`} onClick={e => click_day(e)} data-tab={index}>
                                                <p className='cell_text'>{value.day}</p>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        :
                        <div className='total_calendar_mobile'>
                            <div className={!isMobile() ? 'calendar_view' : 'calendar_view_mobile'}>
                                {
                                    calendar_divs.map((value, index) => {
                                        if (value.time=='now') {
                                            return (
                                                <div key={index} className={ isMobile() ? `calendar_cell_mobile_${value.state}` : `calendar_cell_${value.state}`} onClick={e => click_day(e)} data-tab={index}>
                                                    <p className='cell_text'>{value.day}</p>
                                                </div>
                                            );
                                        }
                                    })
                                }
                            </div>
                        </div>
                        }
                        {!isMobile() && 
                            <div className='calendar_setting'>
                                <p className='viewp'>Légende</p>
                                <div className='state_view'>
                                    <div className='green_veiw'></div>
                                    <p className='viewp'>Ouvert aux réservations</p> 
                                </div>
                                <div className='state_view'>
                                    <div className='red_veiw'></div>
                                    <p className='viewp'>Fermé aux réservations</p> 
                                </div>
                                <div className='state_view'>
                                    <div className='grey_veiw'></div>
                                    <p className='viewp'>Fermé aux réservations</p> 
                                </div>
                                <div className='check_setting'>
                                    <p className='viewp'>Jours de fermeture</p>
                                    <p className='explain'>Ces jours seront outomatiququement fermes chque semaine</p>
                                    <Checkbox
                                        title=" Lundi"
                                        fnClick={(e) => check_day(e, 0)}
                                        checked={state.Lundi}
                                    /><br/>
                                    <Checkbox
                                        title=" Mondi"
                                        fnClick={(e) => check_day(e, 1)}
                                        checked={state.Mondi}
                                    /><br/>
                                    <Checkbox
                                        title=" Mercredi"
                                        fnClick={(e) => check_day(e, 2)}
                                        checked={state.Mercredi}
                                    /><br/>
                                    <Checkbox
                                        title=" Jeudi"
                                        fnClick={(e) => check_day(e, 3)}
                                        checked={state.Jeudi}
                                    /><br/>
                                    <Checkbox
                                        title=" Vendredi"
                                        fnClick={(e) => check_day(e, 4)}
                                        checked={state.Vendredi}
                                    /><br/>
                                    <Checkbox
                                        title=" Samedi"
                                        fnClick={(e) => check_day(e, 5)}
                                        checked={state.Samedi}
                                    /><br/>
                                    <Checkbox
                                        title=" Demanche"
                                        fnClick={(e) => check_day(e, 6)}
                                        checked={state.Demanche}
                                    />
                                </div>
                            </div>
                        }
                    </div>
                    <div className='save_button_div'>
                        <div className='button_explain'>Ñ'oubliez pas de sauvegarder à chaque modifications</div>
                        <ButtonSmall
                            color="green"
                            onClick={()=>GetHoliday()}
                            value={
                                buttonLoading ? (
                                <ReactLoading
                                    className="loadingSpinnerButton"
                                    type="spin"
                                    color="white"
                                    height={23}
                                    width={23}
                                />
                                ) : (
                                "Sauvegarder les modifications"
                                )
                            }
                            disabled={buttonLoading ? "disabled" : null}
                            backgroundColor="green"
                            marginTop="10px"
                            width={'20%'}
                        />
                    </div>
            </div>
        </CSSTransition>
    )
}

export default Prest_Dashboard_Sponsorship