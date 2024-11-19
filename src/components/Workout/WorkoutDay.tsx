import Typewriter from "../../components/ui/TypeWriter";
interface Exercise {
  name: string;
  description: string;
}

export default function WorkoutDay({
  day,
  name,
  warm_up,
  exercises,
  cool_down,
  notes,
  getWorkout,
}: {
  day: string;
  name: string;
  warm_up: string;
  exercises: Exercise[];
  cool_down: string;
  notes: string[];
  getWorkout: any;
}) {
  return (
    <div>
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-semibold mb-1">
          <Typewriter
            words={[`${day}`]}
            delay={25}
            infinite={false}
          ></Typewriter>
        </h1>
        <h2 className="pb-8">
          <Typewriter
            words={[`${name}`]}
            delay={25}
            infinite={false}
          ></Typewriter>
        </h2>
      </div>
      <h2 className="font-semibold text-xl mb-1">Warmup:</h2>
      <p className="text-lg mb-8">
        <Typewriter
          words={[`${warm_up}`]}
          delay={25}
          infinite={false}
        ></Typewriter>
      </p>
      <h2 className="font-semibold text-xl mb-1">
        <Typewriter
          words={["Main Exercises:"]}
          delay={25}
          infinite={false}
        ></Typewriter>
      </h2>
      <div className="flex flex-col gap-1 mb-8">
        {exercises != null &&
          exercises.map((exercise, index) => (
            <p
              className="hover:bg-primary-lighter hover:cursor-pointer text-lg"
              key={index}
              onClick={() => {
                getWorkout(exercise.name);
                console.log(exercises);
              }}
            >
              <Typewriter
                words={[`${exercise.name}: ${exercise.description}`]}
                delay={25}
                infinite={false}
              ></Typewriter>
            </p>
          ))}
      </div>
      <h2 className="font-semibold text-xl mb-1">Cooldown:</h2>
      <p className="text-lg mb-8">{cool_down}</p>
      <h2 className="font-semibold text-xl mb-1">Notes:</h2>
      <div className="flex flex-col gap-1">
        {notes != null &&
          notes.map((note, index) => (
            <div>
              <p className="text-lg" key={index}>
                {
                  <Typewriter
                    words={[note]}
                    delay={25}
                    infinite={false}
                  ></Typewriter>
                }
              </p>
              <br />
            </div>
          ))}
      </div>
    </div>
  );
}
