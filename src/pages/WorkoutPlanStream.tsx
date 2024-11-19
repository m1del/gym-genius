import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import WorkoutDay from "../components/Workout/WorkoutDay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { FadeIn } from "../components/Animation/FadeIn";
import { useContext } from "react";
import OptionsContext from "../context/OptionContext";
import Typewriter from "../components/ui/TypeWriter";

interface Exercise {
  name: string;
  description: string;
}

interface WorkoutPlan {
  day: string;
  name: string;
  "warm-up": string;
  exercises: Exercise[];
  "cool-down": string;
  notes: string[];
}

interface YoutubeVideo {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
  };
}

const WorkoutPlanComponent: React.FC = () => {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [workoutVideos, setWorkoutVideos] = useState<YoutubeVideo[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { level, goal, num_days, notes } = useContext(OptionsContext);
  const newLevel = level[0].toUpperCase() + level.slice(1);
  const newGoal = goal[0].toUpperCase() + goal.slice(1);
  const navigate = useNavigate();

  useEffect(() => {
    const samplePayload = {
      level: level,
      goal: goal,
      num_days: num_days,
      notes: notes,
    };
    console.log(level, goal, num_days, notes);
    const setupAndFetchData = async () => {
      const setupResponse = await fetch(
        "http://localhost:5000/setupWorkoutPlan",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(samplePayload),
        }
      );

      if (setupResponse.ok) {
        const { session_id } = await setupResponse.json();
        const eventSource = new EventSource(
          `http://localhost:5000/generateWorkoutPlan?session_id=${session_id}`
        );
        let currentPlan: WorkoutPlan = {
          day: "",
          name: "",
          "warm-up": "",
          exercises: [],
          "cool-down": "",
          notes: [],
        };
        let buffer = "";

        eventSource.onmessage = (event) => {
          const { message } = JSON.parse(event.data);

          if (message === null) {
            //gpt ends streams with a "null"
            eventSource.close();
            setWorkoutPlans((prevPlans) => [...prevPlans, currentPlan]);
            return;
          }

          buffer += message;

          if (buffer.includes("\n")) {
            const lines = buffer.split("\n");
            buffer = lines.pop() || "";

            lines.forEach((line) => {
              const colonIndex = line.indexOf(":");
              const key = line
                .substring(0, colonIndex)
                .trim()
                .replace(/"/g, "");
              const value = line
                .substring(colonIndex + 1)
                .trim()
                .replace(/"/g, "");

              if (key === "exercise") {
                const [name, description] = value
                  .split(":")
                  .map((part) => part.trim());
                currentPlan.exercises.push({ name, description });
              } else if (key === "note") {
                currentPlan.notes.push(value);
              } else {
                if (["day", "name", "warm-up", "cool-down"].includes(key)) {
                  const propertyKey = key as Exclude<
                    keyof WorkoutPlan,
                    "exercises" | "notes"
                  >;

                  // check if reset for new day
                  if (propertyKey === "day" && currentPlan.day) {
                    setWorkoutPlans((prevPlans) => [...prevPlans, currentPlan]);
                    currentPlan = {
                      day: "",
                      name: "",
                      "warm-up": "",
                      exercises: [],
                      "cool-down": "",
                      notes: [],
                    };
                  } else {
                    currentPlan[propertyKey] = value;
                  }
                } else {
                  console.warn(`Unexpected key received: ${key}`);
                }
              }
            });
          }
        };

        return () => eventSource.close();
      } else {
        console.error("Failed to setup workout plan");
      }
    };

    setupAndFetchData();
  }, []);

  const fetchYoutubeVideos = async (exerciseName: string) => {
    setSearchQuery(exerciseName); // store query for the "See More" button
    const response = await fetch(
      `http://localhost:5000/searchYoutubeVideos?query=${encodeURIComponent(
        exerciseName
      )}`
    );
    if (response.ok) {
      const videos: YoutubeVideo[] = await response.json();
      setWorkoutVideos(videos);
      console.log(videos);
    } else {
      console.error("Failed to fetch YouTube videos");
      setWorkoutVideos([]);
    }
  };

  function onBack() {
    navigate({
      pathname: "/",
    });
  }

  return (
    // <div>
    //   <div>
    //     <h1>Workout Plans</h1>
    //     {workoutPlans.map((plan, index) => (
    //       <div key={index}>
    //         <h2>
    //           {plan.day}: {plan.name}
    //         </h2>
    //         <p>Warm-up: {plan["warm-up"]}</p>
    //         <h3>Exercises</h3>
    //         <ul>
    //           {plan.exercises.map((exercise, idx) => (
    //             <li
    //               key={idx}
    //               onClick={() => fetchYoutubeVideos(exercise.name)}
    //               style={{ cursor: "pointer" }}
    //             >
    //               <strong>{exercise.name}:</strong> {exercise.description}
    //             </li>
    //           ))}
    //         </ul>
    //         <p>
    //           <strong>Cool-down:</strong> {plan["cool-down"]}
    //         </p>
    //         <ul>
    //           {plan.notes.map((note, idx) => (
    //             <li key={idx}>{note}</li>
    //           ))}
    //         </ul>
    //       </div>
    //     ))}
    //   </div>
    //   <div>
    //     {workoutVideos.map((video, index) => (
    //       <div key={index}>
    //         <h4>{video.snippet.title}</h4>
    //         <iframe
    //           width="560"
    //           height="315"
    //           src={`https://www.youtube.com/embed/${video.id.videoId}`}
    //           title="YouTube video player"
    //           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    //           allowFullScreen
    //         ></iframe>
    //       </div>
    //     ))}
    //     <Button
    //       onClick={() =>
    //         window.open(
    //           `https://www.youtube.com/results?search_query=${searchQuery}`,
    //           "_blank"
    //         )
    //       }
    //     >
    //       See More
    //     </Button>
    //   </div>
    // </div>
    <div className="w-full max-w-screen-xl pt-16 flex">
      <FadeIn direction="none" width="100%">
        <div className="w-full h-full flex flex-col justify-center">
          <div className="flex flex-col w-full items-center">
            <h1 className="text-4xl font-bold pb-6">Workout Plan</h1>
            <div className="flex flex-col items-center text-xl font-semibold mb-4">
              <h2 onClick={() => console.log(workoutPlans)}>
                Difficulty: {newLevel}
              </h2>
              <h2>Days a Week: {num_days}</h2>
              <h2>Focus: {newGoal}</h2>
            </div>
          </div>
          <div className="lg:min-h-screen lg:max-h-screen lg:flex-row flex-col flex w-full bg-slate-950 rounded-xl h-[90%] mb-10">
            <div className="flex w-full lg:w-[50%] flex-col gap-16 my-8 overflow-scroll lg:pb-20 px-10 lg:px-14">
              <div className="w-full">
                <Carousel>
                  <CarouselContent>
                    {workoutPlans.map((plan, index) => (
                      <CarouselItem key={index}>
                        <div className="p-1">
                          <Card>
                            <CardContent className="flex aspect-square items-center justify-center p-6">
                              <WorkoutDay
                                day={plan.day}
                                name={plan.name}
                                warm_up={plan["warm-up"]}
                                exercises={plan.exercises}
                                cool_down={plan["cool-down"]}
                                notes={plan.notes}
                                getWorkout={fetchYoutubeVideos}
                              />
                            </CardContent>
                          </Card>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {workoutPlans.length > 0 && (
                    <>
                      <CarouselPrevious />
                      <CarouselNext />
                    </>
                  )}
                </Carousel>
              </div>
            </div>
            <div
              className={`lg:w-[50%] flex justify-center overflow-scroll my-8 ${
                workoutVideos.length == 0 ? "items-center" : ""
              }`}
            >
              <FadeIn width="100%" direction="bottom" delay={0.75}>
                <div className="flex flex-col items-center w-full">
                  {workoutVideos.length > 0 ? (
                    <>
                      {workoutVideos.map((video, index) => (
                        <div key={index} className="mb-4">
                          <h4 className="text-center text-lg w-[400px] md:w-[450px] xl:w-[500px]">
                            {video.snippet.title}
                          </h4>
                          <iframe
                            className=" w-[400px] md:w-[450px] xl:w-[500px] aspect-video"
                            src={`https://www.youtube.com/embed/${video.id.videoId}`}
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      ))}{" "}
                      <Button
                        className="text-xl bg-blue-500 hover:bg-blue-800 m-6 font-semibold py-2 px-4 rounded-lg shadow-md transition duration-200 ease-in-out transform hover:-translate-y-1"
                        onClick={() =>
                          window.open(
                            `https://www.youtube.com/results?search_query=${searchQuery}`,
                            "_blank"
                          )
                        }
                      >
                        See More
                      </Button>
                    </>
                  ) : (
                    <p>Click an exercise to see the tutorial! xoxo &lt;3 </p>
                  )}
                </div>
              </FadeIn>
            </div>
          </div>
          <div className="flex justify-center mb-24">
            <Button onClick={() => onBack()} variant="secondary">
              Return to Start
            </Button>
          </div>
        </div>
      </FadeIn>
    </div>
  );
};

export default WorkoutPlanComponent;
