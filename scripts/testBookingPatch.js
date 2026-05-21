(async()=>{
  const id = 'DIN-57B6105B-1779270053008';
  const base = 'http://localhost:5000';
  const get = async ()=>{
    const r = await fetch(`${base}/api/dineout/booking/${id}`);
    return await r.json();
  }
  console.log('GET original');
  let res = await get();
  console.log(JSON.stringify(res, null, 2));
  const b = res.booking;
  const orig = b.special_requests;

  const patchBody = {
    bookingDate: b.booking_date.split('T')[0],
    bookingTime: b.booking_time.slice(0,5),
    guestCount: b.guest_count,
    specialRequests: 'Verified via automated test'
  };

  console.log('PATCH update');
  const p = await fetch(`${base}/api/dineout/booking/${id}`, {
    method: 'PATCH', headers: {'content-type':'application/json'}, body: JSON.stringify(patchBody)
  });
  console.log('PATCH status', p.status);
  const pJson = await p.json();
  console.log(JSON.stringify(pJson, null, 2));

  console.log('GET after patch');
  res = await get();
  console.log(JSON.stringify(res, null, 2));

  // revert
  const revertBody = {
    bookingDate: b.booking_date.split('T')[0],
    bookingTime: b.booking_time.slice(0,5),
    guestCount: b.guest_count,
    specialRequests: orig
  };
  console.log('PATCH revert');
  const r2 = await fetch(`${base}/api/dineout/booking/${id}`, { method: 'PATCH', headers:{'content-type':'application/json'}, body: JSON.stringify(revertBody)});
  console.log('revert status', r2.status);
  console.log(await r2.json());

  console.log('DONE');
})();
