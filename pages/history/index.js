import { useState, useEffect } from 'react';
import moment from 'moment'
import AppHelper from '../../app-helper'
import AddComma from '../../toString'
import Swal from 'sweetalert2'
import { Alert, Row, Col, Image, Form, Modal, Table, Nav,FormControl,Button } from 'react-bootstrap'

export default function index(){
  const [transaction, setTtransaction] =useState([])
  const [transactionType, setTransactionType] = useState('')
  const [transactionCategory, setTransactionCategory] = useState('')
  const [transactionAmount, setTransactionAmount] = useState(0)
  const [transactionDescription, setTransactionDescription] = useState('')
  const [transactionDate, setTransactionDate] = useState('')
  const [incomevalue, setIncomeValue] = useState(false)
  const [expensevalue, setExpenseValue] = useState(false)
  const[allvalue, setAllValue] = useState(true)
  const [searchResult, setSearchResult] = useState('')
  const [userID, setUserID] = useState('')
  const [balance, setBalance] = useState(null)
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [desciption, setDesciption] = useState('')
  const [showEdit, setShowEdit] = useState(false);
  const [transactionID, setTransactionID] = useState('')
  const [editTransactionType, setEditTransactionType] = useState('')
  const [recordInfo, setRecordInfo] =useState([])
  const handleClose2 = () => {
    setShowEdit(false)
    setAmount('')
    setCategory('')
    setDesciption('')
  }
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

    useEffect(() =>{
        fetch(`${ AppHelper.API_URL }/users/details`,{
            headers:{
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => res.json())
        .then(data => {
            setUserID(data._id)
            setBalance(data.balance)
            const data2 = data.transactions.filter(res => {
                return res.isActive === true
            })
        if(incomevalue === true){
                const active = data2.filter(activeRecords => {
                    return activeRecords.isActive === true && activeRecords.type === "Income" 
                }).reverse()
                setTtransaction(active)
        }
        if(expensevalue === true){
                const active = data2.filter(activeRecords => {
                    return activeRecords.isActive === true && activeRecords.type === "Expenses"
                }).reverse()
                setTtransaction(active)
        }
        if(allvalue === true){
                const active = data2.filter(activeRecords => {
                    return activeRecords.isActive === true
                     
                }).reverse()
                setTtransaction(active)
        }
    })   
    },[transaction, incomevalue, expensevalue, allvalue,balance]) 
 
   
    function DeleteThis(record){
        let amount = record.amount
        let transactionType = record.type
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
          }).then((result) => {
            if (result.isConfirmed) {
                fetch(`${ AppHelper.API_URL }/users/DeleteRecords`,{
                    method: "DELETE",
                    headers:{
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ 
                        transactionId:record._id
                    })
                  })
                  .then(res => res.json())
                  .then(data => {
                      Swal.fire(
                        'Deleted!',
                        'Your file has been deleted.',
                        'success'
                        )
                      setShow(false)
                  })
                  if(transactionType === "Income"){
                     //retrive details to update balance
                        fetch(`${ AppHelper.API_URL }/users/updateBalance`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}` 
                            },
                            body: JSON.stringify({ 
                                userId: userID,
                                balanceAfterTransaction: balance - parseFloat(amount)
                            })
                            
                        })
                        .then(res => res.json())
                        .then(data => {
                            window.location.reload()
                        })
                  }
                  if(transactionType === "Expenses"){
                     //retrive details to update balance
                  fetch(`${ AppHelper.API_URL }/users/updateBalance`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` 
                    },
                    body: JSON.stringify({ 
                        userId: userID,
                        balanceAfterTransaction: balance + parseFloat(amount)
                    })
                    
                    })
                    .then(res => res.json())
                    .then(data => {
                        window.location.reload()
                    })
                  }
            }
          })
        
    }
    const searchFunction = () =>{
        setSearchResult(searchResult)
        setSearchResult('')
        fetch(`${ AppHelper.API_URL }/users/details`,{
            headers:{
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => res.json())
        .then(data => {
            const active = data.transactions.filter((res) => {
                return moment(res.dateAdded).format('MMMM').toLowerCase() == searchResult.toLowerCase()
                 
            }).reverse()
            setTtransaction(active)
         })
    }
     // add Expenses Function
     function EditThis(record){
        setRecordInfo(record)
        setShowEdit(true)
    }
    
    function EditCategory(e){
        e.preventDefault();
        fetch(`${ AppHelper.API_URL }/users/EditRecord`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}` 
            },
            body: JSON.stringify({ 
                userId:userID,
                categoryName:category,
                description:desciption,
                amount:amount,
                transactionId:recordInfo._id

            })
        })
        .then(res => res.json())
        .then(data => {
         })
            Swal.fire({
                title: 'Do you want to save the changes?',
                showDenyButton: true,
                showCancelButton: true,
                confirmButtonText: `Save`,
                denyButtonText: `Don't save`,
              }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    if(recordInfo.type === "Income"){
                        fetch(`${ AppHelper.API_URL }/users/updateBalance`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}` 
                            },
                            body: JSON.stringify({ 
                                userId: userID,
                                balanceAfterTransaction: balance - recordInfo.amount + parseFloat(amount)
                            })
                        })
                        .then(res => res.json())
                        .then(data => {
                            Swal.fire('Saved!', '', 'success')
                            window.location.reload()
                            setShowEdit(false)
                        })
                    }else if(recordInfo.type === "Expenses"){
                        console.log(balance - recordInfo.amount - parseFloat(amount))
                        fetch(`${ AppHelper.API_URL }/users/updateBalance`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}` 
                            },
                            body: JSON.stringify({ 
                                userId: userID,
                                balanceAfterTransaction: balance + recordInfo.amount - parseFloat(amount)
                            })
                        })
                        .then(res => res.json())
                        .then(data => {
                            Swal.fire('Saved!', '', 'success')
                            window.location.reload()
                            setShowEdit(false)
                        })
                    }
                   
                } else if (result.isDenied) {
                  Swal.fire('Changes are not saved', '', 'info')
                  setAmount('')
                  setCategory('')
                  setDesciption('')
                }
              })
    }
   
    return(
        <React.Fragment>
        <Modal show={showEdit} onHide={handleClose} className="bg-light">
            <Modal.Body id="Edit-Record-Modal">
            <h6>Edit Record</h6>
            <Form onSubmit={(e) =>  EditCategory(e)} className="mb-3">
                <Form.Group>
                <Form.Label className="text-muted">New Category</Form.Label>
                    <Form.Control type="text"  className="inputText py-0" placeholder={recordInfo.categoryName} value={category} onChange={(e) => {
                        setCategory(e.target.value)
                    }} required/>
                </Form.Group>
                <Row className="m-0">
                    <Col md={6} xs={6} className="px-0">
                        <Form.Group>
                        <Form.Label className="text-muted">New Description</Form.Label>
                            <Form.Control type="text"  className="inputText py-0 " placeholder={recordInfo.description}  value={desciption} onChange={(e) => {
                        setDesciption(e.target.value)
                    }} required/>
                        </Form.Group>
                    </Col>
                    <Col md={4} xs={6} className="px-0 mx-3">
                    <Form.Group>
                    <Form.Label className="text-muted">New Amount</Form.Label>
                    <Form.Control type="text"  className="inputText py-0 " placeholder={recordInfo.amount}  value={amount} onChange={(e) => {
                       setAmount(e.target.value)
                    }} required/>
                    </Form.Group>
                    </Col>
                </Row>
                <Button variant="danger" onClick={handleClose2} >
                    Close
                </Button>
                <Button variant="primary" type="submit" id="submitBtn2">
                    Save Changes
                </Button>
            </Form>
            </Modal.Body>
        </Modal>
         <Row className="m-0 p-2">
                    <Col xs={12} md={6} className="text-center bg-dark text-white">
                    <Nav className="justify-content-center mt-3 text-10" activeKey="/home">
                    <Form.Group controlId="expensesCheckBox">
                        <Form.Check type="checkbox" checked={expensevalue} onChange={() => {
                            // expensesCheckbox 
                            setExpenseValue(true)
                            setIncomeValue(false)
                            setAllValue(false)
                            }} label="Expenses" />
                    </Form.Group>

                    <Form.Group className="ml-3" controlId="incomeCheckBox">
                        <Form.Check type="checkbox" checked={incomevalue} onChange={() => {
                            // incomeCheckbox
                            setExpenseValue(false)
                            setIncomeValue(true)
                            setAllValue(false)
                            }} label="Income" />
                    </Form.Group>
                    <Form.Group className="ml-3" controlId="allCheckBox">
                        <Form.Check type="checkbox" checked={allvalue} onChange={() => {
                            // allCheckbox
                            setExpenseValue(false)
                            setIncomeValue(false)
                            setAllValue(true)
                            }} label="All" />
                    </Form.Group>
                    </Nav>
                    </Col>
                    <Col>
                    <Form className="text-center head py-2 text-center" inline >
                        <FormControl type="text" placeholder="Search Month" value={searchResult} onChange={e => {
                            setSearchResult(e.target.value)
                        }} className="mx-auto text-10 mr-sm-2" required />
                        {searchResult.length === 0 ?
                        <Button variant="outline-danger"  className="pt-1 text-10" onClick={searchFunction} disabled>Search</Button>
                         :
                        <Button variant="outline-dark"  className="pt-1 text-10" onClick={searchFunction}>Search</Button>
                         }
                        
                    </Form>
                    </Col>
                </Row>
            {transaction <= 0 ? 
                <Alert variant="success" className="text-center mt-4" id="record">No Records Yet!</Alert>
                :
                <>
                <Col xs={12} lg={12} id="record" className="bodyContent">
					<Table striped bordered hover className="w-100" >
						<thead>
                            <tr>
                                <th>Date</th>
                                <th>Transaction</th>
                                <th>Amount Added</th>
                                <th>Transacation Type</th>
                                <th>Description</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody className="t-body text-14">
                        	{transaction.map(record => {
                        		return(
                        			<tr key={record._id}>
                                        <td className="text-14">{moment(record.date).format('MMMM DD YYYY')}</td>
                        				<td className="text-14">{record.categoryName}</td>
                                        <td className="text-14"> ₱ {AddComma(record.amount)}</td>
                                        <td className="text-14">{record.type}</td>
                                        <td className="text-14">{record.description}</td>
                                        <td className="text-center px-0">
                                            <a onClick={(e) => {
                                                    DeleteThis(record)
                                                }} className="text-muted text-right"><Image src="/delete.png" className="buttonimgDel" />
                                            </a>
                                            <a onClick={(e) => {
                                                    EditThis(record)
                                                }} className="text-muted text-right"><Image src="/edit.png" className="buttonimgDel" />
                                            </a>
                                        </td>
									</tr>
                        		)
                        	})}
                        </tbody>
					</Table>
				</Col></>
            }
                {/* small*/}
            
                {transaction <= 0 ? 
                <Alert variant="success" className="text-center mt-4" id="recordShow">No Records Yet!</Alert>
                :
                <Col xs={12} lg={12} id="recordShow" className="p-0 text-10 mt-3 bodyContent overflow-auto">
					 <Table striped bordered hover className="w-100 scroll" >
						<thead>
                            <tr>
                                <th>Date</th>
                                <th className="text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                        	{transaction.map(record => {
                        		return(
                        			<tr key={record._id}>
                        				<td>{moment(record.date).format('MMMM DD, YYYY')}</td>
                        				<td className="text-center" onClick={() =>{
											handleShow()
											setTransactionType(record.type)
											setTransactionCategory(record.categoryName)
											setTransactionAmount(record.amount)
											setTransactionDescription(record.description)
                                            setTransactionDate(moment(record.date).format('MMMM DD, YYYY'))
										} }>View</td>
										<Modal
											show={show}
                                            onHide={handleClose}
                                            onHide={handleClose}
											backdrop="static"
											keyboard={false}
										>
											<Modal.Header closeButton className="py-2">
											</Modal.Header>
											<Modal.Body>
												<Row className="pb-2 my-1 text-14 ">
                                                <Col sm={12} className="py-2 bg-light">Transaction <br />
													<p className="pb-1 px-2  mb-0">	{transactionCategory}</p>
												</Col>
                                                <Col sm={12} className="py-2">Amount Added<br />
													<p className="pb-1 px-2 mb-0">₱	{AddComma(transactionAmount)}.00</p>
												</Col>
                                                <Col sm={12} className="py-2 bg-light">Description <br />
													<p className="pb-1 px-2 bg-light mb-0">	{transactionDescription}</p>
												</Col>
                                                <Col sm={12} className="py-2">Transaction Type<br />
													<p className="pb-1 px-2 mb-0">{transactionType}</p>
												</Col>
                                                <Col sm={12} className="py-2 bg-light">Transaction Date<br />
													<p className="pb-1 px-2 bg-light mb-0">	{moment(transactionDate).format('MMMM DD, YYYY')}</p>
												</Col>
												</Row>
                                                <Col md={4} xs={12} className="px-2 text-center ">
                                                    <a onClick={(e) => {
                                                        DeleteThis(record._id)
                                                    }} className="text-muted mx-3"><Image src="/delete.png" className="buttonimgDel" />Delete
                                                    </a>
                                                    <a onClick={(e) => {
                                                            EditThis(record._id)
                                                        }} className="text-muted text-right"><Image src="/edit.png" className="buttonimgDel" />Edit
                                                    </a>
                                            </Col>
											</Modal.Body>
											
										</Modal>
									</tr>
                        		)
                        	})}
                        </tbody>
					</Table>
				</Col> 
                }
        </React.Fragment>
    )
}
