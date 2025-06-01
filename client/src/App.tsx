import React, { useState, ChangeEvent, FormEvent } from 'react'

interface BookingForm {
  email:          string
  start_date:     string
  end_date:       string
  expire_date:    string
}

interface Model {
  model_id :      number
  model_name:     string
  price_peak :    number
  price_mid :     number
  price_off :     number
}

interface Car {
  car_id:         number
  brand:          string
  model_id:       number
  model :         Model
}

interface Booking {
  book_id:        number
  user_id:        number
  car_id:         number
  start_date:     string
  end_date:       string
  total_price:    number
  average_price:  number
  car:            Car
}

interface AvailabelCar {
  car_id:         number,
  brand:          string
  model_name:     string
  count:          number
  total_price:    number
  average_price:  number
}

const App: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState<BookingForm>({
    email: '',
    start_date: today,
    end_date: today,
    expire_date: today
  })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availableCars, setAvailableCars] = useState<AvailabelCar[]>([])
  const [userId, setUserId] = useState<number>(-1)
  const [message, setMessage] = useState<string>("")
  const [state, setState] = useState<boolean>(false)


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value.toString() })
  }

  // this is the test commit

  // this is the amend commit

  // amend message

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage("")
    try {
      const res = await fetch('http://localhost:3000/available-cars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const result = await res.json()
      if (res.status === 200) {
        setAvailableCars(result.available)
        setBookings(result.bookingList.bookings)
      }
      else {
        setAvailableCars([])
        if(result.errorCode === 401) {
          setBookings([])
          setMessage("Invalid date range");
        } else if(result.errorCode === 402) {
          setBookings([])
          setMessage("Invalid license date");
        } else if(result.errorCode === 403) {
          setBookings(result.bookingList.bookings)
          setMessage("Already Booked");
        }
        setState(false)
      }
      setUserId(result.user_id)
    } catch (err) {
      setMessage('Something went wrong')
      setState(false)
      setAvailableCars([])
    }
  }

  const handleBook = async (index: number) => {
    try {
      const res = await fetch('http://localhost:3000/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...availableCars[index], user_id: userId, start_date: form.start_date, end_date: form.end_date })
      })
      const result = await res.json()
      if(res.status === 201) {
        setMessage("Successfully booked!")
        setState(true)
      }
      setBookings(result.bookings)
      setAvailableCars([])
    } catch (err) {
      setMessage('Something went wrong')
      setState(false)
    }
  }

  return (
    <div className="min-h-screen pt-20">
      {/* Left side - Booking form */}
      <div className="w-full p-8 bg-white">
        <h1 className="text-3xl font-bold mb-6">Car Rental Booking</h1>
        <form onSubmit={handleSubmit} className="space-y-4 flex gap-4 items-center justify-around">
          <label className="block w-1/3">
            <span className="block mb-1">Email</span>
            <input
              className="w-full border border-gray-300 p-2 rounded"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label className="block w-1/6">
            <span className="block mb-1">Start Date</span>
            <input
              className="w-full border border-gray-300 p-2 rounded"
              type="date"
              name="start_date"
              value={form.start_date}
              onChange={handleChange}
              required
            />
          </label>
          <label className="block w-1/6">
            <span className="block mb-1">End Date</span>
            <input
              className="w-full border border-gray-300 p-2 rounded"
              type="date"
              name="end_date"
              value={form.end_date}
              onChange={handleChange}
              required
            />
          </label>
          <label className="block w-1/6">
            <span className="block mb-1">License Expiry Date</span>
            <input
              className="w-full border border-gray-300 p-2 rounded"
              type="date"
              name="expire_date"
              value={form.expire_date}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-1/6 mt-3 ">
            Show Available Cars
          </button>
        </form>
      </div>

      {message !== "" && <div className={`text-3xl w-full text-center font-bold ${state ? "text-blue-500" : "text-red-500"}`}>{message}</div>}

      {/* Right side - Booking list table */}
      <div className="w-full flex">
        <div className="w-5/12 p-8 bg-gray-100 overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-4">Available Cars</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow">
              <thead>
                <tr className="bg-blue-100 text-left">
                  <th className="py-2 px-4 border-b border-gray-300">No</th>
                  <th className="py-2 px-4 border-b border-gray-300">Brand</th>
                  <th className="py-2 px-4 border-b border-gray-300">Model</th>
                  <th className="py-2 px-4 border-b border-gray-300">Stock</th>
                  <th className="py-2 px-4 border-b border-gray-300">Total Price</th>
                  <th className="py-2 px-4 border-b border-gray-300">Avarage Price</th>
                  <th className="py-2 px-4 border-b border-gray-300">Book</th>
                </tr>
              </thead>
              <tbody>
                {availableCars.map((availabelCar, index) => (
                  <tr key={index} className="hover:bg-blue-50">
                    <td className="py-2 px-4 border-b border-gray-300">{index + 1}</td>
                    <td className="py-2 px-4 border-b border-gray-300">{availabelCar.brand}</td>
                    <td className="py-2 px-4 border-b border-gray-300">{availabelCar.model_name}</td>
                    <td className="py-2 px-4 border-b border-gray-300">{availabelCar.count}</td>
                    <td className="py-2 px-4 border-b border-gray-300">{availabelCar.total_price}</td>
                    <td className="py-2 px-4 border-b border-gray-300">{availabelCar.average_price}</td>
                    <td className="py-2 px-4 border-b border-gray-300">
                      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700" onClick={() => handleBook(index)}>
                        Book
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="w-7/12 p-8 bg-gray-100 overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-4">Booking List</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow">
              <thead>
                <tr className="bg-blue-100 text-left">
                  <th className="py-2 px-4 border-b border-gray-300">No</th>
                  <th className="py-2 px-4 border-b border-gray-300">Brand</th>
                  <th className="py-2 px-4 border-b border-gray-300">Model</th>
                  <th className="py-2 px-4 border-b border-gray-300">Start Date</th>
                  <th className="py-2 px-4 border-b border-gray-300">End Date</th>
                  <th className="py-2 px-4 border-b border-gray-300">Total Price</th>
                  <th className="py-2 px-4 border-b border-gray-300">Average Price</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={index} className="hover:bg-blue-50">
                    <td className="py-2 px-4 border-b border-gray-300">{index + 1}</td>
                    <td className="py-2 px-4 border-b border-gray-300">{booking.car.brand}</td>
                    <td className="py-2 px-4 border-b border-gray-300">{booking.car.model.model_name}</td>
                    <td className="py-2 px-4 border-b border-gray-300">{booking.start_date}</td>
                    <td className="py-2 px-4 border-b border-gray-300">{booking.end_date}</td>
                    <td className="py-2 px-4 border-b border-gray-300">{booking.total_price}</td>
                    <td className="py-2 px-4 border-b border-gray-300">{booking.average_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App