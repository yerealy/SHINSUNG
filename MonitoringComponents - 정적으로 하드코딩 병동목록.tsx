import React, { useState, useEffect, ComponentProps } from 'react';
import SelectBox from 'components/public/selectBox';
import Button from 'components/public/button';
import dateFormat from 'components/public/dateFormat';
import styled from 'styled-components';
import ImgUrl from 'components/public/alarmImg';
import batteryImgUrl from 'components/public/batteryImg';

import { useRecoilValue, useRecoilState } from 'recoil';
import { MonitoringState, wardIDState, monitoringRefreshState } from 'recoils/MonitoringRecoil';

import { QueryObserverResult, RefetchOptions, RefetchQueryFilters } from 'react-query';

import ResultTable from 'components/public/resultTable';
import { SearchBar } from 'hooks/UseSearchbar';
import useCrossTabState from 'hooks/UseCrossTabState';

type AlarmList = {
    alarmID: number;
    alarmName: string;
    alarmType: boolean;
}

type ImgClickType = {
    click: number;
    onClick: React.Dispatch<React.SetStateAction<number>>;
}

export function ImgClick({click, onClick}: ImgClickType) {

    // 모니터링 정보를 크게 보는지 작게 보는지
    const [, setState] = useRecoilState(MonitoringState);

    // 0: zoom_in, 1: zoom_out
    const changeImg: ComponentProps<'img'>['onClick'] = (e) => {
        const class_name = e.currentTarget.className.split(" ")[0];
        /* clicked_img */
        if(class_name === "zoom_in") {
            onClick(0);
            setState(0);
        } else if(class_name === "zoom_out") {
            onClick(1);
            setState(1);
        }
    }

    let in_img_name:string = "zoom_in";
    let out_img_name:string = "zoom_out";

    if(click === 0) {
        in_img_name += " clicked_img";
    } else if (click === 1) {
        out_img_name += " clicked_img";
    }

    return (
        <>
            <img onClick = {changeImg} className={out_img_name} src={`${process.env.PUBLIC_URL}/assets/images/zoomOut.png`} alt= "작게" />
            <img onClick = {changeImg} className={in_img_name} src={`${process.env.PUBLIC_URL}/assets/images/zoomIn.png`} alt= "크게" />
        </>
    )
}

type MonitoringTypeV2 = {
    data: Array<MonitoringDataV2>;
    refresh:<TPageData>(options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined) => Promise<QueryObserverResult<any, unknown>>;
    setHospitals: React.Dispatch<React.SetStateAction<number>>;
    hospitals: number;
    date: Date;
    setDate : React.Dispatch<React.SetStateAction<Date>>;
}

export function MonitoringV2({data, refresh, setHospitals, hospitals, date, setDate}: MonitoringTypeV2) {

    // 모니터링 정보를 크게 보는지 작게 보는지
    const monitor_state = useRecoilValue<number>(MonitoringState);
    const [img, setImg] = useState<number>(monitor_state);

    console.log(data);

    return(
        <div className="monitoring">
            <MemoMonitorHeadV2 data_count = { data ? data.length : 0 } boxSize = {img} setImg = {setImg} refresh = {refresh} date = {date} setDate = {setDate} setHospitals = {setHospitals}/>
            <MemoMonitorBodyV2 data={data} boxSize = {img} refresh = {refresh} hospitals = {hospitals}/>
        </div>
    )

}

export const MemoMonitoringV2 = React.memo(MonitoringV2);

type MonitorHeadDataV2 = {
    data_count: number;
    boxSize: number;
    setImg: React.Dispatch<React.SetStateAction<number>>;
    refresh:<TPageData>(options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined) => Promise<QueryObserverResult<any, unknown>>;
    date: Date;
    setDate : React.Dispatch<React.SetStateAction<Date>>;
    setHospitals: React.Dispatch<React.SetStateAction<number>>;
}

function MonitorHeadV2({ data_count, boxSize, setImg, refresh, date, setDate, setHospitals }: MonitorHeadDataV2) {

    // 갱신버튼 클릭시
    const refreshClick = () => {
        setDate(new Date());
        refresh();
    }

    const [tableRefetch, setTableRefetch] = useCrossTabState('tableRefetch', false);

    useEffect(() => {
        if(tableRefetch){
            console.log("refresh");
            refreshClick();
        }
        setTableRefetch(false);
    }, [tableRefetch])

    const selectBar = SearchBar();

    return (
        <div className="monitor_head">
            <div className="monitor_status">
                {(selectBar.hospitalApi !== null && !selectBar.hospitalApi.isLoading) && 
                    <SelectBox subject='병원' size='L' options={selectBar.hospitalApi.data.data} onChange = {setHospitals} paramsID = {selectBar.paramsID} setParmsID = {selectBar.setParamsID} setAsync = {selectBar.setAsync}/> 
                }
                <div>총 <span>{data_count}</span>대</div>
            </div> 
            <div className="monitor_array">
                <div className="array_box">
                    <ImgClick click = {boxSize} onClick = { setImg }/>
                    <Button onClick = {refreshClick} name='갱신' size='S' image="Refresh" />
                </div>
                <div className="monitor_refresh_time">최근갱신 : <span>{dateFormat(date)}</span></div>
            </div>
        </div>
    )
}

export const MemoMonitorHeadV2 = React.memo(MonitorHeadV2);

function RefreshClick() {
    console.log("refresh");
}

export type MonitoringDataV2 = {
    alarmList: AlarmList[],
    bedName: string,
    chartNumber: string,
    injectRinger: number,
    pairingID: number,
    patientName: string,
    remainBattery: number,
    ringerName: string,
    ringerSpeed: number,
    totalRinger: number,
    remainTime: string,
    isMonitoring: boolean,
    remainRinger: number,
    //
    isValid: boolean,
    isSetTotal: boolean
}


type MonitorBodyDataV2 = {
    data: Array<MonitoringDataV2>;
    boxSize: number;
    refresh:<TPageData>(options?: (RefetchOptions & RefetchQueryFilters<TPageData>) | undefined) => Promise<QueryObserverResult<any, unknown>>;
    hospitals: number;
}

function MonitorBodyV2({data, boxSize, refresh, hospitals}: MonitorBodyDataV2) {

    console.log(data);

    // wardID recoil에 저장
    const [ , setWardID ] = useRecoilState(wardIDState);

    let class_name:string = "monitor_box";

    if(boxSize === 0) {
        class_name = "monitor_box_s_V2"
    }

    // 새창 띄우기
    const openPop = (pairingID:number, isMonitoring:boolean) =>{
        
        if(isMonitoring) {
            window.open(`/popupV2?pairing=${pairingID}&hospital=${hospitals === 0 ? 0 : hospitals}`, 'popUp',"width=968, height=832px");
        }
    }

    return (
        <div className = "monitor_total_body">
            <div className = "monitor_body">
            {
                data &&
                data.length > 0 ?
                data.map(beds => (
                    <div className= {class_name +" "+ ((boxSize === 0 && beds.alarmList.length !== 0 && beds.alarmList[0].alarmName !== "BATTERY")? beds.alarmList[0].alarmName : "")} key = {beds.pairingID} onClick = {() => {setWardID(beds.pairingID); openPop(beds.pairingID, beds.isMonitoring)}}>
                        <MemoMonitorBoxHeadV2 key = {"head" + beds.pairingID} name={beds.bedName + " " + beds.patientName} alarms= {beds.alarmList} boxSize = {boxSize}  remainBattery = {beds.remainBattery} chartNumber = {beds.chartNumber} isMonitoring = {beds.isMonitoring}/>
                        <MemoMonitorBoxBodyV2 key = {"body" + beds.pairingID} name={beds.bedName + " " + beds.patientName} ringer_short_name={beds.ringerName} now_speed={beds.ringerSpeed} device_battery = {beds.remainBattery} boxSize = {boxSize} alarmState ={beds.alarmList} injectRinger = {beds.injectRinger} isMonitoring = {beds.isMonitoring} isValid = {beds.isValid}/>
                        <MemoMonitorBoxFootV2 key = {"foot" + beds.pairingID} total_ml={beds.totalRinger} injectRinger ={beds.injectRinger} boxSize = {boxSize} remainTime = {beds.remainTime} isMonitoring={beds.isMonitoring} isSetTotal={beds.isSetTotal} />
                    </div>
                ))
                :
                <div>먼저 병원을 선택해주세요.</div>
            }
            </div>
        </div>
    )
}

export const MemoMonitorBodyV2 = React.memo(MonitorBodyV2);

type monitor_headV2 = {
    alarms: AlarmList[];
    name: string;
    boxSize: number;
    remainBattery: number;
    chartNumber : string;
    isMonitoring: boolean;
}

function MonitorBoxHeadV2({alarms, name, boxSize, remainBattery, chartNumber, isMonitoring}: monitor_headV2) {

    let class_name:string = "monitor_box_head"
    if(boxSize === 0) {
        class_name = "monitor_box_head_s_V2"
    }

    return (
        <div className={class_name}>
            <div className = "monitor_box_head_imgs_wrapper">
                <div>
                    {
                        alarms.length === 0 ? 
                        <img className = "warining_imgs" src = {ImgUrl("BASIC")} alt = "알람_이미지"/>
                        :
                        alarms.map((alarm, index) => (
                            <img key = {index} className = "warining_imgs background" src = {ImgUrl(alarm.alarmName)} alt = "알람_이미지"/>
                        ))
                    }
                </div>
                { isMonitoring && boxSize === 1 &&
                    <div className = "monitor_battery_info">
                        <img src = {batteryImgUrl(remainBattery)} alt = "알람_이미지"/><span>{remainBattery+"%"}</span>
                    </div>
                }
            </div>
            { boxSize === 1 && 
                <div className = "monitor_infomations">
                    <div className = "monitor_name">{name}</div>
                    <div className = "monitor_medical_record">{chartNumber}</div>
                </div>
            }
        </div>
    )

}

export const MemoMonitorBoxHeadV2 = React.memo(MonitorBoxHeadV2);

type monitor_bodyV2 = {
    name: string;
    ringer_short_name: string;
    now_speed: number;
    device_battery: number;
    boxSize: number;
    alarmState: AlarmList[];
    injectRinger: number;
    isMonitoring : boolean;
    //
    isValid: boolean;
}

function MonitorBoxBodyV2({name, ringer_short_name, now_speed, device_battery, boxSize, alarmState, injectRinger, isMonitoring, isValid}: monitor_bodyV2) {
    
    return (
        <>
        { boxSize === 1 ?
            <div className="monitor_box_body">
                {(isMonitoring && isValid) && <div className="monitor_small_status">
                    <div className = {`alarm_blink ${alarmState.length !== 0 ? alarmState[0].alarmName !== "BATTERY" ? alarmState[0].alarmName : "" : ""}`}>
                        <div className= 'monitor_small_status_box line'>
                            <div>속도</div>
                            <div className = 'monitor_speed_status_box'>{now_speed}gtt ({now_speed*3}ml/h)</div>
                        </div>
                    </div>
                    {/* <div className = {`battery_blink ${alarmState.length !== 0 ? alarmState[0].alarmName === "BATTERY" ? alarmState[0].alarmName : "" : ""}`}>
                        <div className='monitor_small_status_box'>
                            <div>배터리</div>
                            <div>{device_battery}%</div>
                        </div>
                    </div> */}
                    <div className = "battery_blink">
                        <div className='monitor_small_status_box'>
                            <div>투여용량</div>
                            <div>{injectRinger} ml</div>
                        </div>
                    </div>
                </div>}
                {(isMonitoring && !isValid) && 
                <div className="monitor_small_not_status">
                    <h2>수액 확인 필요</h2>
                </div>}
                {!isMonitoring && 
                <div className="monitor_small_not_status">
                    <h2>측정 대기중</h2>
                </div>}
            </div>
            :
            <div className="monitor_box_body_s_V2">
                <div className = "monitor_name">{name}</div>
            </div>
        }
        </>
    )
}

export const MemoMonitorBoxBodyV2 = React.memo(MonitorBoxBodyV2);

type monitor_footV2 = {
    total_ml : number;
    injectRinger : number;
    boxSize : number;
    remainTime : string;
    isMonitoring?: boolean;
    isSetTotal?: boolean;
}

function MonitorBoxFootV2({total_ml, injectRinger, boxSize, remainTime, isMonitoring, isSetTotal}: monitor_footV2) {

    return (
        <div className= {boxSize === 1 ? "monitor_box_foot" : "monitor_box_foot_V2"}>
            { boxSize === 1 && 
                <div className = "monitor_ringer_ml">
                    <div>투여현황(ml)</div>
                    <div>{remainTime}</div>
                </div>
            }
            { isSetTotal &&
                <div>
                    <MemoProgressbarV2 total_ml={total_ml} injectRinger={injectRinger} boxSize = {boxSize} remainTime={""}/>
                    <MemoProgressBarText total_ml={total_ml} boxSize = {boxSize} isMonitoring = {isMonitoring}/>
                </div>
            }
            { !isSetTotal &&
                <div className = "not_set_total_ml">-</div>
            }
        </div>
    )
}

export const MemoMonitorBoxFootV2 = React.memo(MonitorBoxFootV2);

type MonitoringProgressBarText = {
    total_ml : number;
    boxSize : number;
    isMonitoring?: boolean;
}

function ProgressBarText({total_ml, boxSize, isMonitoring}: MonitoringProgressBarText) {

    const text:StandardType = {total_ml};

    return (
        boxSize === 1 ?
        <div className = "progress_text_body">
            <div className={total_ml < 1000 ? "monitor_ringer_ml" : "monitor_ringer_ml"}>
                {Standard(text)}
            </div>
            <div className = "progress_total_ml"><span>{isMonitoring ? total_ml : "ㅤ"}</span></div>
        </div>
        :
        null
        
    )

}

export const MemoProgressBarText = React.memo(ProgressBarText);


const FillGraphV2 = styled.div<{percent: number, height:number}> `
        width: ${(props) => props.percent > 100 ? "100" :(props) => (props.percent)}%;
        background-color: #6089F3;
        height: ${(props) => (props.height)}px;
        z-index: 1;
        border-radius: 2px;
        position: absolute;
        top: 0;
    `;

const ProgressStandard = styled.div<{height:number, width:number}> `
        width: ${(props) => (props.width)}%;
        border-right: 1px solid rgba(255,255,255,0.8);
        height: ${(props) => (props.height)}px;
        position: absolute;
        z-index: 10;
    `;

const ProgressStandardText = styled.div<{width:number, padding:number}> `
        width: ${(props) => (props.width)}%;
        position: absolute;
        text-align: right;
        padding-left: ${(props) => (props.padding)}px;
        z-index: 10;
`;

function ProgressbarV2({total_ml, injectRinger, boxSize}: monitor_footV2) {

    // percent만큼 width를 설정하여 프로그레스바를 채움
    const percent: number = Math.round((injectRinger/(total_ml))*100);
    const [percents, setPercent] = useState<number>(percent);

    // percent가 바뀔때마다 프로그레스바를 재설정
    useEffect(() => {
        setPercent(percent);
    }, [percent])

    let class_name:string = "monitor_progressbar";
    let class_name_graph:string = "progress_body"
    let height:number = 18;

    if(boxSize === 0) {
        class_name = "monitor_progressbar_s";
        class_name_graph = "progress_body_s"
        height = 12;
    } else if(boxSize === -1) {
        class_name = "monitor_progressbar_up";
    }

    const bar: StandardType = {total_ml, height};
    
    return (
        <div className={class_name}>
            <div className = {class_name_graph}>
                <div className={total_ml < 1000 ? "monitor_ringer_ml" : "monitor_ringer_ml"}>
                    {Standard(bar)}
                </div>
                <FillGraphV2 percent = {percents} height = {height}/>
            </div>
        </div>
    )
}

export const MemoProgressbarV2 = React.memo(ProgressbarV2);

type dashboardData = {
    data: Array<MonitoringDataV2>;
    folding: boolean;
}

interface DataItem {
    hospital: string; // 병동 정보
    bed: string;      // 베드 정보
    patientName: string; // 환자 이름
    alarm: string;    // 알람 정보
}

interface DashboardData {
    data: DataItem[]; // 데이터 배열
    folding: boolean; // 접힘 상태
}


function SideDashboard({ data, folding }: { data: any[]; folding: boolean }) {
    const wardList = ["101동", "102동"];
    const [selectedWard, setSelectedWard] = useState<string | null>(null);

    const handleWardClick = (ward: string) => {
        setSelectedWard(ward);
    };

    const th_name = ["베드", "환자명", "알람"];

    return (
        <div className={"side_dashboard" + (folding ? " folding" : "")}>
            {!selectedWard ? (
                <div className="ward_list">
                    <h3>병동 목록</h3>
                    <ul>
                        {wardList.map((ward) => (
                            <li key={ward} onClick={() => handleWardClick(ward)}>
                                {ward}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>
                    <button onClick={() => setSelectedWard(null)}>← 병동 목록으로</button>
                    <h3>{selectedWard}</h3>
                    <table>
                        <thead>
                            <tr>
                                {th_name.map((name, index) => (
                                    <th key={index}>{name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.filter((item) => item.hospital === selectedWard).length === 0 ? (
                                selectedWard === "101동" ? (
                                    <>
                                        <tr>
                                            <td>1</td>
                                            <td>유재석</td>
                                            <td>fast</td>
                                        </tr>
                                        <tr>
                                            <td>2</td>
                                            <td>박명수</td>
                                            <td>slow</td>
                                        </tr>
                                        <tr>
                                            <td>3</td>
                                            <td>정준하</td>
                                            <td>fast</td>
                                        </tr>
                                        <tr>
                                            <td>4</td>
                                            <td>하하</td>
                                            <td>fast</td>
                                        </tr>
                                    </>
                                ) : (
                                    <>
                                        <tr>
                                            <td>1</td>
                                            <td>김종국</td>
                                            <td>fast</td>
                                        </tr>
                                        <tr>
                                            <td>2</td>
                                            <td>송지효</td>
                                            <td>slow</td>
                                        </tr>
                                    </>
                                )
                            ) : (
                                data
                                    .filter((item) => item.hospital === selectedWard)
                                    .map((row, index) => (
                                        <tr key={index}>
                                            <td>{row.bed}</td>
                                            <td>{row.patientName}</td>
                                            <td>{row.alarm}</td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default SideDashboard;

export const MemoSideDashboard = React.memo(SideDashboard);

export type StandardType = {
    total_ml: number;
    height? : number;
}

export function Standard({total_ml, height}: StandardType) {

    // 프로그레스바 안에 기준이 되는 선 위치
    let standardMl:number[] = [100, 200, 300, 500];

    let standardCnt = 0;

    if(total_ml > 100) {
        standardMl.map((ml, index) => {
            if(total_ml - ml > 0) {
                return standardCnt = index+1;
            } else {
                return null;
            }
        })
    } 

    const result = [];

    // height가 있는 경우: 프로그레스바 안의 선
    // height가 없는 경우: 프로그레스바 아래 용량
    if(height) {
        if(total_ml < 1000) {
            for (let i = 0; i < standardCnt; i++) {
                if(standardMl[i]/total_ml*100 < 80) {
                    result.push(<ProgressStandard key = {i} height={height} width = {standardMl[i]/total_ml*100} />);
                }
            }
        } else {
            result.push(<ProgressStandard key = {0} height={height} width = {(Math.floor(total_ml*0.1))/total_ml*100}/>);
            result.push(<ProgressStandard key = {1} height={height} width = {(Math.floor(total_ml*0.2))/total_ml*100}/>);
            result.push(<ProgressStandard key = {2} height={height} width = {(Math.floor(total_ml*0.3))/total_ml*100}/>);
            result.push(<ProgressStandard key = {3} height={height} width = {(Math.floor(total_ml*0.5))/total_ml*100}/>);
        }
    } else {
        if(total_ml < 1000) {
            for (let i = 0; i < standardCnt; i++) {
                if(standardMl[i]/total_ml*100 < 80) {
                    result.push(<ProgressStandardText key = {i} width = {standardMl[i]/total_ml*100} padding={12}><span>{standardMl[i]}</span></ProgressStandardText>);
                }
            }
        } else {
            result.push(<ProgressStandardText key = {0} width = {10} padding={8}><span>{Math.floor(total_ml/10*0.1)*10}</span></ProgressStandardText>);
            result.push(<ProgressStandardText key = {1} width = {20} padding={12}><span>{Math.floor(total_ml/10*0.2)*10}</span></ProgressStandardText>);
            result.push(<ProgressStandardText key = {2} width = {30} padding={16}><span>{Math.floor(total_ml/10*0.3)*10}</span></ProgressStandardText>);
            result.push(<ProgressStandardText key = {3} width = {50} padding={12}><span>{Math.floor(total_ml/10*0.5)*10}</span></ProgressStandardText>);
        }
    }

    return result

}