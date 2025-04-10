import React, { useState } from 'react';
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

  const handleAssign = () => {
    setAssignments([...assignments, { station, loadID, time: new Date().toLocaleTimeString() }]);
    setStation('');
    setLoadID('');
  };

  const handleScan = () => {
    if (!processorStation) {
      alert('Please select your station.');
      return;
    }

    setScans([...scans, { station: processorStation, loadID, time: new Date().toLocaleTimeString() }]);
    setLoadID('');
  };

  const getDiscrepancies = () => {
    const stationGroups = {};
    assignments.forEach(a => {
      if (!stationGroups[a.station]) stationGroups[a.station] = { assigned: 0, scanned: 0 };
      stationGroups[a.station].assigned += 1;
    });
    scans.forEach(s => {
      if (!stationGroups[s.station]) stationGroups[s.station] = { assigned: 0, scanned: 0 };
      stationGroups[s.station].scanned += 1;
    });
    return Object.entries(stationGroups).map(([station, data]) => ({
      station,
      assigned: data.assigned,
      scanned: data.scanned,
      mismatch: data.assigned !== data.scanned
    }));
  };

  // Export the discrepancy list to PDF
  const exportToPDF = () => {
    const doc = new jsPDF();

    const discrepancies = getDiscrepancies();
    
    discrepancies.forEach((discrepancy, idx) => {
      if (idx > 0) {
        doc.addPage(); // Add a new page for each station
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.text(`Discrepancy Report for Station: ${discrepancy.station}`, 20, 20);

      // Add employee ID and details
      doc.setFontSize(12);
      doc.text(`Employee ID: ${discrepancy.station}`, 20, 40); // Using the station as Employee ID for now
      doc.text(`Pallets Assigned: ${discrepancy.assigned}`, 20, 50);
      doc.text(`LoadIDs Scanned: ${discrepancy.scanned}`, 20, 60);

      // Display mismatch status
      doc.text(`Mismatch: ${discrepancy.mismatch ? 'Yes' : 'No'}`, 20, 70);
    });

    doc.save("discrepency-report.pdf");
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
                  onChange={e => setStation(e.target.value)}
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

              {/* Station Selection for Processor */}
              {!processorStation ? (
                <div className="space-y-4">
                  <select
                    onChange={e => setProcessorStation(e.target.value)}
                    value={processorStation}
                  >
                    <option value="">-- Choose Station --</option>
                    {mockStations.map(station => (
                      <option key={station} value={station}>{station}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-green-600">You are currently assigned to {processorStation}</p>
                </div>
              )}

              <div className="space-y-4">
                <Input
                  placeholder="Enter LoadID"
                  value={loadID}
                  onChange={e => setLoadID(e.target.value)}
                />
                <Button onClick={handleScan}>Scan LoadID</Button>
              </div>

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
          {getDiscrepancies().map((d, i) => (
            <TableRow key={i}>
              <TableCell>{d.station}</TableCell>
              <TableCell>{d.assigned}</TableCell>
              <TableCell>{d.scanned}</TableCell>
              <TableCell className={d.mismatch ? 'text-red-500' : 'text-green-600'}>
                {d.mismatch ? 'Yes' : 'No'}
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
