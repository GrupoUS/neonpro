import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Database } from "../types/supabase";

type Tables = Database["public"]["Tables"];

// Specific hooks for each table with proper typing
export const useRealtimeAgendamentos = () => {
  const [data, setData] = useState<Tables["agendamentos"]["Row"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const channel = supabase
      .channel("public:agendamentos")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agendamentos" },
        (payload) => {
          console.log("Realtime change received!", payload);
          fetchData();
        }
      )
      .subscribe();

    const fetchData = async () => {
      try {
        const { data: fetchedData, error: fetchError } = await supabase
          .from("agendamentos")
          .select("*");

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setData(fetchedData || []);
        }
      } catch (err) {
        setError("Erro ao buscar dados");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { data, loading, error };
};

export const useRealtimeClients = () => {
  const [data, setData] = useState<Tables["pacientes"]["Row"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const channel = supabase
      .channel("public:pacientes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pacientes" },
        (payload) => {
          console.log("Realtime change received!", payload);
          fetchData();
        }
      )
      .subscribe();

    const fetchData = async () => {
      try {
        const { data: fetchedData, error: fetchError } = await supabase
          .from("pacientes")
          .select("*");

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setData(fetchedData || []);
        }
      } catch (err) {
        setError("Erro ao buscar dados");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { data, loading, error };
};

export const useRealtimeServices = () => {
  const [data, setData] = useState<Tables["services"]["Row"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const channel = supabase
      .channel("public:services")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "services" },
        (payload) => {
          console.log("Realtime change received!", payload);
          fetchData();
        }
      )
      .subscribe();

    const fetchData = async () => {
      try {
        const { data: fetchedData, error: fetchError } = await supabase
          .from("services")
          .select("*");

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setData(fetchedData || []);
        }
      } catch (err) {
        setError("Erro ao buscar dados");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { data, loading, error };
};

export const useRealtimeProfessionals = () => {
  const [data, setData] = useState<Tables["professionals"]["Row"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const channel = supabase
      .channel("public:professionals")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "professionals" },
        (payload) => {
          console.log("Realtime change received!", payload);
          fetchData();
        }
      )
      .subscribe();

    const fetchData = async () => {
      try {
        const { data: fetchedData, error: fetchError } = await supabase
          .from("professionals")
          .select("*");

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setData(fetchedData || []);
        }
      } catch (err) {
        setError("Erro ao buscar dados");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { data, loading, error };
};

export const useRealtimeTransactions = () => {
  const [data, setData] = useState<Tables["transacoes"]["Row"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const channel = supabase
      .channel("public:transacoes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "transacoes" },
        (payload) => {
          console.log("Realtime change received!", payload);
          fetchData();
        }
      )
      .subscribe();

    const fetchData = async () => {
      try {
        const { data: fetchedData, error: fetchError } = await supabase
          .from("transacoes")
          .select("*");

        if (fetchError) {
          setError(fetchError.message);
        } else {
          setData(fetchedData || []);
        }
      } catch (err) {
        setError("Erro ao buscar dados");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { data, loading, error };
};
