import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableHead, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { jsPDF } from "jspdf";

const mockStations = Array.from({ length: 40 }, (_, i) => `PS0${String(i + 1).padStart(2, '0')}`);

export default function LoadIDTrackingDemo() {
  const [assignments, setAssignments] = useState([]);
  const [scans, setScans] = useState([]);
  const [station, setStation] = useState('');
  const [loadID, setLoadID] = useState('');
  const [processorStation, setProcessorStation] = useState('');
  const [employeeID, setEmployeeID] = useState('');
  const [employeeLoggedIn, setEmployeeLoggedIn] = useState(false);

  useEffect(() => {
    document.title = "Demo Interface";
  }, []);

  const handleAssign = () => {
    setAssignments([...assignments, { station, loadID, time: new Date().toLocaleTimeString() }]);
    setStation('');
    setLoadID('');
  };

  const handleScan = () => {
    if (!processorStation || !employeeID) {
      alert('Please enter your Employee ID and select your station.');
      return;
    }

    setScans([...scans, { station: processorStation, loadID, processorID: employeeID, time: new Date().toLocaleTimeString() }]);
    setLoadID('');
  };

  const handleLogin = () => {
    if (employeeID.trim().length === 6 && processorStation) {
      setEmployeeLoggedIn(true);
    } else {
      alert("Please enter a valid 6-digit Employee ID and select a station.");
    }
  };

  const handleLogout = () => {
    setEmployeeID('');
    setProcessorStation('');
    setEmployeeLoggedIn(false);
  };

  const getDetailedDiscrepancies = () => {
    const stationMap = {};

    assignments.forEach(({ station, loadID }) => {
      if (!stationMap[station]) {
        stationMap[station] = { assignedLoadIDs: [], scannedLoadIDs: [], processorID: null };
      }
      stationMap[station].assignedLoadIDs.push(loadID);
    });

    scans.forEach(({ station, loadID, processorID }) => {
      if (!stationMap[station]) {
        stationMap[station] = { assignedLoadIDs: [], scannedLoadIDs: [], processorID };
      }
      stationMap[station].scannedLoadIDs.push(loadID);
      stationMap[station].processorID = processorID;
    });

    return Object.entries(stationMap).map(([station, data]) => {
      const { assignedLoadIDs, scannedLoadIDs, processorID } = data;
      const missingLoadIDs = assignedLoadIDs.filter(id => !scannedLoadIDs.includes(id));

      return {
        station,
        processorID: processorID || "N/A",
        assignedLoadIDs,
        scannedLoadIDs,
        missingLoadIDs,
        hasMismatch: missingLoadIDs.length > 0
      };
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const discrepancies = getDetailedDiscrepancies();
  
    discrepancies.forEach((discrepancy, idx) => {
      if (idx > 0) doc.addPage();
  
      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.text(`Discrepancy Report`, 20, 20);
  
      doc.setFontSize(12);
      doc.text(`Station: ${discrepancy.station}`, 20, 30);
      doc.text(`Processor: ${discrepancy.processorID}`, 20, 40);
  
      doc.setFontSize(11);
      doc.text(`Assigned LoadIDs:`, 20, 50);
      const assignedWithTimes = assignments
        .filter(a => a.station === discrepancy.station)
        .map(a => `${a.loadID} (${a.time})`);
      doc.text(assignedWithTimes.join(', '), 20, 58);
  
      doc.text(`Scanned LoadIDs:`, 20, 70);
      const scannedWithTimes = scans
        .filter(s => s.station === discrepancy.station)
        .map(s => `${s.loadID} (${s.time})`);
      doc.text(scannedWithTimes.join(', '), 20, 78);
  
      doc.setFontSize(11);
      doc.text(`Mismatch: ${discrepancy.hasMismatch ? 'Yes' : 'No'}`, 20, 90);
  
      if (discrepancy.hasMismatch) {
        doc.setTextColor(200, 0, 0);
        doc.text(`Missing LoadIDs (Assigned but not scanned):`, 20, 100);
        doc.text(discrepancy.missingLoadIDs.join(', '), 20, 108);
        doc.setTextColor(0, 0, 0);
      }
    });
  
    doc.save("discrepancy-report.pdf");
  };
  

  return (
    <div className="centered-container">
      {/* Header */}
      <header className="header">
        <img src="./CargoTrack.png" alt="CargoTrack Logo" className="header-logo" />
        <h1 className="header-title">Station Assignment Demo</h1>
      </header>

      <div className="box-container">
        {/* Station Assignment Box */}
        <div className="station-box">
          <Card className="p-6 bg-white shadow-lg rounded-lg">
            <CardContent className="space-y-6">
              <h2 className="text-3xl font-semibold text-center text-indigo-600">Station/Pallet Assignment</h2>
              <div className="space-y-4">
                <Input
                  placeholder="Enter Station (e.g., Station 1)"
                  value={station}
                  onChange={e => setStation(e.target.value.toUpperCase())}
                />
                <Input
                  placeholder="Enter LoadID"
                  value={loadID}
                  onChange={e => setLoadID(e.target.value)}
                />
                <Button onClick={handleAssign}>Assign Pallet</Button>
              </div>

              <Table className="mt-6 w-full text-center">
                <TableHead>
                  <TableRow>
                    <TableCell className="font-semibold text-indigo-600">Station</TableCell>
                    <TableCell className="font-semibold text-indigo-600">LoadID</TableCell>
                    <TableCell className="font-semibold text-indigo-600">Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assignments.map((a, i) => (
                    <TableRow key={i}>
                      <TableCell>{a.station}</TableCell>
                      <TableCell>{a.loadID}</TableCell>
                      <TableCell>{a.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Processor Scan Box */}
        <div className="processor-box">
          <Card className="p-6 bg-white shadow-lg rounded-lg">
            <CardContent className="space-y-6">
              <h2 className="text-3xl font-semibold text-center text-green-600">Processor LoadID Scan</h2>

              {!employeeLoggedIn ? (
                <div className="space-y-4">
                  <Input
                    placeholder="Enter 6-digit Employee ID"
                    value={employeeID}
                    onChange={e => setEmployeeID(e.target.value)}
                  />
                  <select
                    onChange={e => setProcessorStation(e.target.value)}
                    value={processorStation}
                  >
                    <option value="">-- Choose Station --</option>
                    {mockStations.map(station => (
                      <option key={station} value={station}>{station}</option>
                    ))}
                  </select>
                  <Button onClick={handleLogin}>Log In</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-green-600">Employee {employeeID} logged in at {processorStation}</p>
                  <Button variant="outline" onClick={handleLogout}>Logout</Button>
                </div>
              )}

              {employeeLoggedIn && (
                <div className="space-y-4">
                  <Input
                    placeholder="Enter LoadID"
                    value={loadID}
                    onChange={e => setLoadID(e.target.value)}
                  />
                  <Button onClick={handleScan}>Scan LoadID</Button>
                </div>
              )}

              <Table className="mt-6">
                <TableHead>
                  <TableRow>
                    <TableCell className="text-left font-semibold text-green-600">Station</TableCell>
                    <TableCell className="text-left font-semibold text-green-600">LoadID</TableCell>
                    <TableCell className="text-left font-semibold text-green-600">Time</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {scans.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell>{s.station}</TableCell>
                      <TableCell>{s.loadID}</TableCell>
                      <TableCell>{s.time}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Discrepancy Report */}
      <div className="discrepancy-container mt-8 w-full">
        <Card className="bg-white shadow-lg rounded-lg p-6">
          <CardContent>
            <h2 className="text-3xl font-semibold text-center text-gray-700 mb-4">Discrepancy Report</h2>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell className="text-left font-semibold text-gray-700">Station</TableCell>
                  <TableCell className="text-left font-semibold text-gray-700">Pallets Assigned</TableCell>
                  <TableCell className="text-left font-semibold text-gray-700">LoadIDs Scanned</TableCell>
                  <TableCell className="text-left font-semibold text-gray-700">Mismatch</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getDetailedDiscrepancies().map((d, i) => (
                  <TableRow key={i}>
                    <TableCell>{d.station}</TableCell>
                    <TableCell>{d.assignedLoadIDs.join(', ')}</TableCell>
                    <TableCell>{d.scannedLoadIDs.join(', ')}</TableCell>
                    <TableCell className={d.hasMismatch ? 'text-red-500' : 'text-green-600'}>
                      {d.hasMismatch ? 'Yes' : 'No'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="mt-4 text-center">
              <Button onClick={exportToPDF}>Export Discrepancies to PDF</Button>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Footer */}
      <footer className="w-full bg-maroon text-white py-3 fixed bottom-0 left-0 flex justify-between px-4">
        <span className="text-sm">Demo Product</span>
        <span className="text-sm">Credit to: Cameron Hodges 2025</span>
      </footer>
    </div>
  );
}
