import { createClient } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const supabaseUrl = import.meta.env.VITE_SUPABASE_PROJECT_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY;
export const supabase = createClient(supabaseUrl, supabaseKey);

import React from "react";
export const queryClient = new QueryClient();
export function SupabaseProvider({ children }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
}

const fromSupabase = async (query) => {
    const { data, error } = await query;
    if (error) throw error;
    return data;
};

/* supabase integration types

### user_secrets

| name       | type        | format | required |
|------------|-------------|--------|----------|
| id         | uuid        | string | true     |
| user_id    | uuid        | string | true     |
| secret     | text        | string | true     |
| created_at | timestamptz | string | true     |

### benchmark_scenarios

| name             | type        | format | required |
|------------------|-------------|--------|----------|
| id               | uuid        | string | true     |
| name             | text        | string | true     |
| description      | text        | string | false    |
| prompt           | text        | string | true     |
| llm_model        | text        | string | true     |
| llm_temperature  | numeric     | number | true     |
| created_at       | timestamptz | string | true     |

### benchmark_results

| name        | type        | format | required |
|-------------|-------------|--------|----------|
| id          | uuid        | string | true     |
| scenario_id | uuid        | string | true     |
| user_id     | uuid        | string | false    |
| result      | jsonb       | object | true     |
| created_at  | timestamptz | string | true     |

### reviewers

| name             | type        | format | required |
|------------------|-------------|--------|----------|
| id               | uuid        | string | true     |
| scenario_id      | uuid        | string | true     |
| dimension        | text        | string | true     |
| description      | text        | string | true     |
| prompt           | text        | string | true     |
| weight           | numeric     | number | true     |
| llm_model        | text        | string | true     |
| llm_temperature  | numeric     | number | true     |
| run_count        | integer     | number | true     |
| created_at       | timestamptz | string | true     |

### review_dimensions

| name        | type        | format | required |
|-------------|-------------|--------|----------|
| id          | uuid        | string | true     |
| name        | text        | string | true     |
| description | text        | string | false    |
| created_at  | timestamptz | string | true     |

*/

// User Secrets
export const useUserSecrets = () => useQuery({
    queryKey: ['user_secrets'],
    queryFn: () => fromSupabase(supabase.from('user_secrets').select('*'))
});

export const useUserSecret = (id) => useQuery({
    queryKey: ['user_secrets', id],
    queryFn: () => fromSupabase(supabase.from('user_secrets').select('*').eq('id', id).single())
});

export const useAddUserSecret = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newSecret) => fromSupabase(supabase.from('user_secrets').insert([newSecret])),
        onSuccess: () => {
            queryClient.invalidateQueries('user_secrets');
        },
    });
};

export const useUpdateUserSecret = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('user_secrets').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('user_secrets');
        },
    });
};

export const useDeleteUserSecret = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('user_secrets').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('user_secrets');
        },
    });
};

// Benchmark Scenarios
export const useBenchmarkScenarios = () => useQuery({
    queryKey: ['benchmark_scenarios'],
    queryFn: () => fromSupabase(supabase.from('benchmark_scenarios').select('*'))
});

export const useBenchmarkScenario = (id) => useQuery({
    queryKey: ['benchmark_scenarios', id],
    queryFn: () => fromSupabase(supabase.from('benchmark_scenarios').select('*').eq('id', id).single())
});

export const useAddBenchmarkScenario = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newScenario) => {
            const { data, error } = await supabase.from('benchmark_scenarios').insert([newScenario]).select();
            if (error) throw error;
            if (!data || data.length === 0) throw new Error("No data returned from scenario creation");
            return data[0];
        },
        onSuccess: () => {
            queryClient.invalidateQueries('benchmark_scenarios');
        },
    });
};

export const useUpdateBenchmarkScenario = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('benchmark_scenarios').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('benchmark_scenarios');
        },
    });
};

export const useDeleteBenchmarkScenario = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('benchmark_scenarios').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('benchmark_scenarios');
        },
    });
};

// Benchmark Results
export const useBenchmarkResults = () => useQuery({
    queryKey: ['benchmark_results'],
    queryFn: () => fromSupabase(supabase.from('benchmark_results').select('*'))
});

export const useBenchmarkResult = (id) => useQuery({
    queryKey: ['benchmark_results', id],
    queryFn: () => fromSupabase(supabase.from('benchmark_results').select('*').eq('id', id).single())
});

export const useAddBenchmarkResult = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newResult) => fromSupabase(supabase.from('benchmark_results').insert([newResult])),
        onSuccess: () => {
            queryClient.invalidateQueries('benchmark_results');
        },
    });
};

export const useUpdateBenchmarkResult = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('benchmark_results').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('benchmark_results');
        },
    });
};

export const useDeleteBenchmarkResult = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('benchmark_results').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('benchmark_results');
        },
    });
};

// Reviewers
export const useReviewers = () => useQuery({
    queryKey: ['reviewers'],
    queryFn: () => fromSupabase(supabase.from('reviewers').select('*'))
});

export const useReviewer = (id) => useQuery({
    queryKey: ['reviewers', id],
    queryFn: () => fromSupabase(supabase.from('reviewers').select('*').eq('id', id).single())
});

export const useAddReviewer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (newReviewer) => {
            const { data, error } = await supabase.from('reviewers').insert([newReviewer]).select();
            if (error) throw error;
            if (!data || data.length === 0) throw new Error("No data returned from reviewer creation");
            return data[0];
        },
        onSuccess: () => {
            queryClient.invalidateQueries('reviewers');
        },
    });
};

export const useUpdateReviewer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('reviewers').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('reviewers');
        },
    });
};

export const useDeleteReviewer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('reviewers').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('reviewers');
        },
    });
};

// Review Dimensions
export const useReviewDimensions = () => useQuery({
    queryKey: ['review_dimensions'],
    queryFn: () => fromSupabase(supabase.from('review_dimensions').select('*'))
});

export const useReviewDimension = (id) => useQuery({
    queryKey: ['review_dimensions', id],
    queryFn: () => fromSupabase(supabase.from('review_dimensions').select('*').eq('id', id).single())
});

export const useAddReviewDimension = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newDimension) => fromSupabase(supabase.from('review_dimensions').insert([newDimension])),
        onSuccess: () => {
            queryClient.invalidateQueries('review_dimensions');
        },
    });
};

export const useUpdateReviewDimension = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => fromSupabase(supabase.from('review_dimensions').update(updateData).eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('review_dimensions');
        },
    });
};

export const useDeleteReviewDimension = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => fromSupabase(supabase.from('review_dimensions').delete().eq('id', id)),
        onSuccess: () => {
            queryClient.invalidateQueries('review_dimensions');
        },
    });
};