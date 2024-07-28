import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseAuth } from "../integrations/supabase/auth";
import { useBenchmarkScenarios, useAddRun, useAddResult } from "../integrations/supabase";
import { toast } from "sonner";
import Navbar from "../components/Navbar";
import { impersonateUser } from "../lib/userImpersonation";

const StartBenchmark = () => {
  const navigate = useNavigate();
  const { session } = useSupabaseAuth();
  const { data: scenarios, isLoading: scenariosLoading } = useBenchmarkScenarios();
  const [selectedScenarios, setSelectedScenarios] = useState([]);
  const [systemVersion, setSystemVersion] = useState(import.meta.env.VITE_SYSTEM_VERSION || "http://localhost:8000");
  const [isRunning, setIsRunning] = useState(false);
  const addRun = useAddRun();
  const addResult = useAddResult();

  const handleScenarioToggle = (scenarioId) => {
    setSelectedScenarios((prev) =>
      prev.includes(scenarioId)
        ? prev.filter((id) => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  const handleStartBenchmark = useCallback(async () => {
    if (selectedScenarios.length === 0) {
      toast.error("Please select at least one scenario to run.");
      return;
    }

    setIsRunning(true);

    try {
      for (const scenarioId of selectedScenarios) {
        const scenario = scenarios.find((s) => s.id === scenarioId);
        
        // Call user impersonation function
        const impersonationResults = await impersonateUser(scenario.prompt, systemVersion);

        // Extract project ID from impersonation results
        const projectId = impersonationResults.find(result => result.type === 'project_created')?.data?.id;

        if (!projectId) {
          throw new Error('Failed to get project ID from impersonation results');
        }

        // Create new run entry
        const runData = await addRun.mutateAsync({
          scenario_id: scenarioId,
          system_version: systemVersion,
          project_id: projectId,
          user_id: session.user.id,
        });

        // Save run results
        for (const reviewer of scenario.reviewers) {
          await addResult.mutateAsync({
            run_id: runData.id,
            reviewer_id: reviewer.id,
            result: {
              impersonation_results: impersonationResults,
              system_version: systemVersion,
            },
          });
        }

        toast.success(`Benchmark completed for scenario: ${scenario.name}`);
      }

      toast.success("All benchmarks completed successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error running benchmark:", error);
      toast.error("An error occurred while running the benchmark. Please try again.");
    } finally {
      setIsRunning(false);
    }
  }, [selectedScenarios, scenarios, systemVersion, session, addBenchmarkResult, addRun, navigate]);

  if (scenariosLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4">Select Scenarios</h2>
          <div className="space-y-4 mb-8">
            {scenarios.map((scenario) => (
              <div key={scenario.id} className="flex items-center space-x-2">
                <Checkbox
                  id={scenario.id}
                  checked={selectedScenarios.includes(scenario.id)}
                  onCheckedChange={() => handleScenarioToggle(scenario.id)}
                />
                <Label htmlFor={scenario.id}>{scenario.name}</Label>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-4">Select System Version</h2>
          <Select value={systemVersion} onValueChange={setSystemVersion}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select system version" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="http://localhost:8000">http://localhost:8000</SelectItem>
              {import.meta.env.VITE_SYSTEM_VERSION && (
                <SelectItem value={`http://${import.meta.env.VITE_SYSTEM_VERSION}`}>
                  http://{import.meta.env.VITE_SYSTEM_VERSION}
                </SelectItem>
              )}
              {/* Add more options here in the future */}
            </SelectContent>
          </Select>

          <Button 
            onClick={handleStartBenchmark} 
            className="mt-8 w-full"
            disabled={isRunning}
          >
            {isRunning ? "Running Benchmark..." : "Start Benchmark"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default StartBenchmark;
