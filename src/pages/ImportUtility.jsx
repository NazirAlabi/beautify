import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { PageHeader } from '../components/PageHeader';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Button';
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react';
import dataCsv from '../../data.csv?raw';

export const ImportUtility = () => {
  const { addTransaction } = useData();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const parseCsv = (csv) => {
    const lines = csv.split('\n').filter(line => line.trim() !== '');
    if (lines.length < 2) return [];
    
    // Skip header line
    return lines.slice(1).map(line => {
      const [month, dateStr, glamType, amountStr] = line.split(',');
      const parsedAmount = parseFloat(amountStr);
      const cleanGlamType = glamType?.trim();

      return {
        type: 'income',
        category: cleanGlamType === 'Soft' ? 'Soft Glam' : (cleanGlamType === 'Full' ? 'Full Glam' : cleanGlamType),
        amount: isNaN(parsedAmount) ? 0 : parsedAmount,
        date: new Date(dateStr.trim()).toISOString(),
        description: 'Imported from CSV'
      };
    });
  };

  const handleImport = async () => {
    setLoading(true);
    setResults(null);
    try {
      const parsedData = parseCsv(dataCsv);
      let successCount = 0;
      let errorCount = 0;

      for (const tx of parsedData) {
        try {
          await addTransaction(tx);
          successCount++;
        } catch (e) {
          console.error("Failed to add transaction:", e);
          errorCount++;
        }
      }

      setResults({ success: successCount, errors: errorCount, total: parsedData.length });
      if (errorCount === 0) {
        toast.success(`Successfully imported ${successCount} transactions!`);
      } else {
        toast.error(`Imported ${successCount}, but ${errorCount} failed.`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to parse or import CSV');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10 animate-fade-in">
      <PageHeader 
        title="CSV Import Utility"
        subtitle="Import transaction data from root data.csv"
      />
      <GlassCard className="p-8 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary">
          <UploadCloud size={32} />
        </div>
        
        <div>
          <h3 className="text-xl font-bold text-foreground">Import Data</h3>
          <p className="text-muted-foreground mt-2 max-w-sm">
            This will read <code>data.csv</code> from the project root and create an income transaction for each row. 
            "Soft" and "Full" are automatically mapped to "Soft Glam" and "Full Glam".
          </p>
        </div>

        {results && (
          <div className="w-full bg-secondary/20 p-4 rounded-xl text-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 text-success">
              <CheckCircle size={16} />
              <span>Successfully imported {results.success} transactions</span>
            </div>
            {results.errors > 0 && (
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle size={16} />
                <span>Failed to import {results.errors} transactions</span>
              </div>
            )}
          </div>
        )}

        <Button 
          onClick={handleImport} 
          disabled={loading}
          className="w-full max-w-xs h-12"
        >
          {loading ? 'Importing...' : 'Start Import'}
        </Button>
      </GlassCard>
    </div>
  );
};
